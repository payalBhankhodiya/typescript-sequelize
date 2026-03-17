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

export const liveDeviceData = handleRequest(
  async (req: Request, res: Response) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

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
      where: {
        createdAt: {
          [Op.gte]: oneHourAgo,
        },
      },
      order: [["createdAt", "ASC"]],
      raw: true,
    });

    return res.status(200).json({
      message: "Getting data successfully!!!",
      live: live || {},
      data: data,
    });
  },
);

// unbind device
export const unbindDevice = handleRequest(
  async (req: Request, res: Response) => {
    const { device_uuid } = req.params;

    const device = await Device.findOne({ where: { device_uuid } });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const objDevice = device.toJSON();

    if (!objDevice.binded_at) {
      return res.status(400).json({ message: "Device is already unbound" });
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

    return res.json({ message: "Device unbind successfully" });
  },
);

// replace device 
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

    return res.json({
      message: "Device replaced successfully",
    });
  },
);
