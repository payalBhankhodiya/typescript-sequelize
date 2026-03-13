import type { Request, Response } from "express";
import Device from "../models/Device.js";
import User from "../models/User.js";
import Site from "../models/Site.js";
import LoggerDeviceData from "../models/Logger_device_data.js";
import DeviceStatus from "../models/Device_status.js";

import {
  handleRequest,
  validateId,
  findOrFail,
  withTransaction,
} from "../services/controllerService.js";

/**
 * @swagger
 * tags:
 *   name: User/Sites
 *   description: Site management APIs
 */

// CREATE SITE

/**
 * @swagger
 * /api/user/sites:
 *   post:
 *     summary: Create a new site
 *     tags: [User/Sites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site_id:
 *                 type: string
 *                 example: abc123
 *               site_address:
 *                 type: string
 *                 example: rajkot
 *               site_type:
 *                 type: string
 *                 example: xyz
 *               site_devices:
 *                 type: array
 *                 example: [device1, device2]
 *               site_owner:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Site created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Site'
 *       500:
 *         description: Internal server error
 */

export const createSite = handleRequest(async (req: Request, res: Response) => {
  const site = await Site.create({
    site_id: req.body.site_id,
    site_address: req.body.site_address,
    site_type: req.body.site_type,
    site_owner: req.body.site_owner,
  });
  res.status(201).json({ data: site });
});

// GET ALL SITES

/**
 * @swagger
 * /api/user/sites:
 *   get:
 *     summary: Get all sites
 *     tags: [User/Sites]
 *     responses:
 *       200:
 *         description: List of sites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Site'
 *       500:
 *         description: Internal server error
 */

export const getAllSites = handleRequest(
  async (req: Request, res: Response) => {
    const sites = await Site.findAll();
    res.status(200).json({ data: sites });
  },
);

// GET SITE BY ID

/**
 * @swagger
 * /api/user/sites/{id}:
 *   get:
 *     summary: Get site by ID
 *     tags: [User/Sites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Site ID
 *     responses:
 *       200:
 *         description: Site details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Site'
 *       404:
 *         description: Site not found
 *       500:
 *         description: Internal server error
 */

export const getSiteById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const site = await findOrFail(Site, id, "Site not found");

    res.status(200).json({ data: site });
  },
);

// UPDATE SITE

/**
 * @swagger
 * /api/user/sites/{id}:
 *   put:
 *     summary: Update site
 *     tags: [User/Sites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Site ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site_id:
 *                 type: string
 *                 example: abc123
 *               site_address:
 *                 type: string
 *                 example: rajkot
 *               site_type:
 *                 type: string
 *                 example: xyz
 *               site_devices:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["550e8400-e29b-41d4-a716-446655440001","550e8400-e29b-41d4-a716-446655440002"]
 *               site_owner:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Site updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Site updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Site'
 *       404:
 *         description: Site not found
 *       500:
 *         description: Internal server error
 */

export const updateSite = handleRequest(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

  const site = await findOrFail(Site, id, "Site not found");

  await site.update(req.body);

  res.status(200).json({
    message: "Site updated successfully",
    data: site,
  });
});

// DELETE SITE

/**
 * @swagger
 * /api/user/sites/{id}:
 *   delete:
 *     summary: Delete site
 *     tags: [User/Sites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Site ID
 *     responses:
 *       200:
 *         description: Site deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Site deleted successfully
 *       404:
 *         description: Site not found
 *       500:
 *         description: Internal server error
 */

export const deleteSite = handleRequest(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

  const site = await findOrFail(Site, id, "Site not found");

  await site.destroy();

  res.json({ message: "Site deleted successfully" });
});

/**
 * @swagger
 * tags:
 *   name: User/Device_data
 *   description: Device data management APIs
 */

// GET DEVICE DATA

/**
 * @swagger
 * /api/user/device/data:
 *   get:
 *     summary: Get all device data
 *     tags: [User/Device_data]
 *     responses:
 *       200:
 *         description: List of device data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoggerDeviceData'
 *       500:
 *         description: Internal server error
 */

export const getAllDeviceData = handleRequest(
  async (req: Request, res: Response) => {
    const data = await LoggerDeviceData.findAll();
    res.status(200).json({ data });
  },
);

// GET DEVICE DATA BY ID

/**
 * @swagger
 * /api/user/device/data/{id}:
 *   get:
 *     summary: Get device data by ID
 *     tags: [User/Device_data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: device data ID
 *     responses:
 *       200:
 *         description: device data details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/LoggerDeviceData'
 *       404:
 *         description: Device's data not found
 *       500:
 *         description: Internal server error
 */

export const getDeviceDataById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const deviceData = await findOrFail(
      LoggerDeviceData,
      id,
      "Device data not found",
    );

    res.status(200).json({ data: deviceData });
  },
);

/**
 * @swagger
 * tags:
 *   name: User/Device_status
 *   description: Device status management APIs
 */

// GET DEVICE STATUS

/**
 * @swagger
 * /api/user/device/status:
 *   get:
 *     summary: Get all device status
 *     tags: [User/Device_status]
 *     responses:
 *       200:
 *         description: List of device status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeviceStatus'
 *       500:
 *         description: Internal server error
 */

export const getAllDeviceStatus = handleRequest(
  async (req: Request, res: Response) => {
    const data = await DeviceStatus.findAll();
    res.status(200).json({ data });
  },
);

// GET DEVICE STATUS BY ID

/**
 * @swagger
 * /api/user/device/status/{id}:
 *   get:
 *     summary: Get device status by ID
 *     tags: [User/Device_status]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: device status ID
 *     responses:
 *       200:
 *         description: device status details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeviceStatus'
 *       404:
 *         description: Device's status not found
 *       500:
 *         description: Internal server error
 */

export const getDeviceStatusById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const deviceStatus = await findOrFail(
      DeviceStatus,
      id,
      "Device status not found",
    );

    res.status(200).json({ data: deviceStatus });
  },
);

/**
 * @swagger
 * tags:
 *   name: User/Device
 *   description: Device management APIs
 */

// bind device

/**
 * @swagger
 * /api/user/binds/device:
 *   post:
 *     summary: Bind a device to a user and site
 *     tags: [User/Device]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               device_id:
 *                 type: string
 *                 example: DEV123456
 *               site_id:
 *                 type: string
 *                 example: SITE123
 *     responses:
 *       200:
 *         description: Device binded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device binded successfully
 *                 device:
 *                   $ref: '#/components/schemas/Device'
 *       404:
 *         description: User, Site, or Device not found
 *       400:
 *         description: Device already binded
 *       500:
 *         description: Internal server error
 */
export const bindDevice = handleRequest(async (req: Request, res: Response) => {
  const { user_id, device_id, site_id } = req.body;

  const device = await withTransaction(async (transaction: any) => {
    const user = await User.findByPk(user_id, { transaction });
    if (!user) throw new Error("User not found");

    const site = await Site.findOne({
      where: { site_id },
      transaction,
    });

    if (!site) throw new Error("Site not found");

    const device = await Device.findOne({
      where: { device_id },
      transaction,
    });

    if (!device) throw new Error("Device not found");

    if (device.binded) throw new Error("Device already binded");

    await device.update(
      {
        binded: true,
        binded_to: user_id,
        binded_at: site_id,
      },
      { transaction },
    );

    return device;
  });

  res.status(200).json({
    message: "Device binded successfully",
    device,
  });
});

// find device

/**
 * @swagger
 * /api/user/find/device:
 *   post:
 *     summary: find device
 *     description: Finds a device by device_id, validates binding, stores logger data, and updates device status.
 *     tags: [User/Device_data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_id:
 *                 type: string
 *                 example: DEV123456
 *               raw_data:
 *                 type: string
 *                 example: raw sensor payload
 *               data:
 *                 type: object
 *                 example: { temperature: 25, humidity: 60 }
 *     responses:
 *       200:
 *         description: Device data processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device data processed successfully
 *       400:
 *         description: device_id is required
 *       404:
 *         description: Device not found
 *       422:
 *         description: Device is not binded to any site
 *       500:
 *         description: Internal server error
 */
export const findDevice = handleRequest(async (req: Request, res: Response) => {
  const { device_id, raw_data, data } = req.body;

  if (!device_id) {
    return res.status(400).json({
      message: "device_id is required",
    });
  }

  await withTransaction(async (transaction: any) => {
    const device = await Device.findOne({
      where: { device_id },
      transaction,
    });

    if (!device) {
      throw new Error("Device not found");
    }

    const deviceData = device.get({ plain: true });

    if (!deviceData.binded || !deviceData.binded_at) {
      throw new Error("Device is not binded to any site");
    }

    // LOGGER DEVICE LOGIC
    if (deviceData.device_type?.toLowerCase() === "logger") {
      await LoggerDeviceData.create(
        {
          device_uuid: deviceData.device_uuid,
          device_id: deviceData.device_id,
          raw_data: raw_data || null,
          data: data || null,
          site_id: deviceData.binded_at,
        },
        { transaction },
      );

      console.log("Device data inserted");

      await DeviceStatus.upsert(
        {
          device_uuid: deviceData.device_uuid,
          device_id: deviceData.device_id,
          device_status: "active",
          device_last_seen: new Date(),
          device_last_data: data || null,
        },
        { transaction },
      );
      console.log("Device status updated");
    }
  });

  return res.status(200).json({
    message: "Device data processed successfully",
  });
});
