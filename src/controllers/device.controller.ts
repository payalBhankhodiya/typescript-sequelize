import type { Request, Response } from "express";
import Device from "../models/Device.js";
import LoggerDeviceData from "../models/Logger_device_data.js";
import {
  handleRequest,
  withTransaction,
} from "../services/controllerService.js";
import DeviceStatus from "../models/Device_status.js";
import { Op, Sequelize } from "sequelize";
import Site from "../models/Site.js";

/**
 * @swagger
 * tags:
 *   name: Device
 *   description: Logger Device management APIs
 */

// logger device

/**
 * @swagger
 * /api/devices/logger:
 *   post:
 *     summary: Store logger device data
 *     description: Accepts data from logger devices, stores it, and updates device status.
 *     tags: [Device]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_id
 *             properties:
 *               device_id:
 *                 type: string
 *                 example: "DEV12345"
 *               device_uuid:
 *                 type: string
 *                 example: "uuid-1234-5678"
 *               raw_data:
 *                 type: object
 *                 example: { "temp": 25.5, "humidity": 60 }
 *               data:
 *                 type: object
 *                 example: { "temperature": 25.5, "humidity": 60 }
 *               site_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Logger device data stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logger device data stored successfully
 *                 data:
 *                   type: object
 *                   description: Stored device data record
 *       400:
 *         description: Bad request (missing device_id or invalid device type)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingDeviceId:
 *                       value: device_id is required
 *                     invalidType:
 *                       value: Invalid device type Only logger devices allowed
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
export const loggerDevice = handleRequest(
  async (req: Request, res: Response) => {
    const { device_id, device_uuid, raw_data, data, site_id } = req.body;

    if (!device_id) {
      return res.status(400).json({
        message: "device_id is required",
      });
    }

    const device = await Device.findOne({
      where: { device_id },
    });

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }
    const objDevice = device.toJSON();

    if (objDevice.device_type !== "logger") {
      return res.status(400).json({
        message: "Invalid device type Only logger devices allowed",
      });
    }

    const deviceData = await LoggerDeviceData.create({
      device_uuid,
      device_id,
      raw_data,
      data,
      site_id,
    });

    console.log("Device data inserted");

    const updateDeviceStatus = await DeviceStatus.upsert({
      device_uuid: device_uuid,
      device_id: device_id,
      device_status: "active",
      device_last_seen: new Date(),
      device_last_data: data,
    });
    console.log("Device status updated : ", updateDeviceStatus);

    return res.status(201).json({
      message: "Logger device data stored successfully",
      data: deviceData,
    });
  },
);

// live device
export const liveDeviceData = handleRequest(
  async (req: Request, res: Response) => {
    const { hour, createFrom, createTo } = req.query;

    const where: any = {};

    if (hour !== undefined) {
      const hours = Number(hour);

      if (
        Number.isNaN(hours) ||
        hours < 0 ||
        hours > 24 ||
        !Number.isInteger(hours)
      ) {
        return res.status(400).json({
          message: "hour must be an integer between 0 and 24",
        });
      }

      const timeInHours = new Date(Date.now() - hours * 60 * 60 * 1000);

      where.createdAt = {
        [Op.gte]: timeInHours,
      };
    }

    if (createFrom || createTo) {
      where.createdAt = {};

      if (createFrom) {
        where.createdAt[Op.gte] = new Date(createFrom as string);
      }

      if (createTo) {
        where.createdAt[Op.lte] = new Date(createTo as string);
      }
    }

    const attributes = [
      [Sequelize.literal(`(data->>'temperature')::float`), "temperature"],
      [Sequelize.literal(`(data->>'humidity')::float`), "humidity"],
      ["createdAt", "created"],
    ] as any;

    const live = await LoggerDeviceData.findOne({
      attributes,
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const data = await LoggerDeviceData.findAll({
      attributes,
      where,
      order: [["createdAt", "ASC"]],
      raw: true,
    });

    return res.status(200).json({
      message: "Getting data successfully!!!",
      live: live || {},
      data,
    });
  },
);

// unbind device

/**
 * @swagger
 * /api/devices/unbind/{device_uuid}:
 *   patch:
 *     summary: Unbind a device from a site
 *     description: Removes a device from its associated site and updates its binding status.
 *     tags: [Device]
 *     parameters:
 *       - in: path
 *         name: device_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the device
 *         example: "uuid-1234-5678"
 *     responses:
 *       200:
 *         description: Device unbound successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device unbind successfully
 *       400:
 *         description: Device already unbound
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device is already unbind
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
export const unbindDevice = handleRequest(
  async (req: Request, res: Response) => {
    const { device_uuid } = req.params;

    const device = await Device.findOne({ where: { device_uuid } });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const objDevice = device.toJSON();

    if (!objDevice.binded_at) {
      return res.status(400).json({ message: "Device is already unbind" });
    }

    const siteId = objDevice.binded_at;

    await Site.update(
      {
        site_devices: Sequelize.fn(
          "array_remove",
          Sequelize.col("site_devices"),
          objDevice.device_uuid,
        ),
      },

      {
        where: { site_id: siteId },
      },
    );

    await device.update({
      binded: false,
      binded_to: null,
      binded_at: null,
    });

    return res.status(200).json({ message: "Device unbind successfully" });
  },
);

// replace device

/**
 * @swagger
 * /api/devices/replace:
 *   post:
 *     summary: Replace a device
 *     description: Replaces an old bound device with a new unbound device within the same site using a transaction.
 *     tags: [Device]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_device_uuid
 *               - new_device_uuid
 *             properties:
 *               old_device_uuid:
 *                 type: string
 *                 example: "old-uuid-1234"
 *               new_device_uuid:
 *                 type: string
 *                 example: "new-uuid-5678"
 *     responses:
 *       200:
 *         description: Device replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device replaced successfully
 *       400:
 *         description: Validation or business logic error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingFields:
 *                       value: Both old_device_uuid and new_device_uuid are required
 *                     oldNotBinded:
 *                       value: Old device is not binded
 *                     newAlreadyBinded:
 *                       value: New device is already binded
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device not found
 *       500:
 *         description: Internal server error (transaction failure)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
export const replaceDevice = handleRequest(
  async (req: Request, res: Response) => {
    const { old_device_uuid, new_device_uuid } = req.body;

    if (!old_device_uuid || !new_device_uuid) {
      return res.status(400).json({
        message: "Both old_device_uuid and new_device_uuid are required",
      });
    }

    await withTransaction(async (transaction: any) => {
      const oldDevice = await Device.findOne({
        where: { device_uuid: old_device_uuid },
        transaction,
      });

      const newDevice = await Device.findOne({
        where: { device_uuid: new_device_uuid },
        transaction,
      });

      if (!oldDevice || !newDevice) {
        const err: any = new Error("Device not found");
        err.status = 404;
        throw err;
      }

      const plainOldDevice = oldDevice.toJSON();

      if (!plainOldDevice.binded_at) {
        const err: any = new Error("Old device is not binded");
        err.status = 400;
        throw err;
      }

      const objNewDevice = newDevice.toJSON();

      if (objNewDevice.binded_at) {
        const err: any = new Error("New device is already binded");
        err.status = 400;
        throw err;
      }

      const siteId = plainOldDevice.binded_at;

      // Remove old device from site
      await Site.update(
        {
          site_devices: Sequelize.fn(
            "array_remove",
            Sequelize.col("site_devices"),
            plainOldDevice.device_uuid,
          ),
        },
        {
          where: { site_id: siteId },
          transaction,
        },
      );

      // Add new device to site
      await Site.update(
        {
          site_devices: Sequelize.fn(
            "array_append",
            Sequelize.col("site_devices"),
            objNewDevice.device_uuid,
          ),
        },
        {
          where: { site_id: siteId },
          transaction,
        },
      );

      // Unbind old device
      await oldDevice.update(
        {
          binded: false,
          binded_to: null,
          binded_at: null,
        },
        { transaction },
      );

      // Bind new device
      await newDevice.update(
        {
          binded: true,
          binded_to: oldDevice.binded_to,
          binded_at: siteId,
        },
        { transaction },
      );
    });

    return res.status(200).json({
      message: "Device replaced successfully",
    });
  },
);
