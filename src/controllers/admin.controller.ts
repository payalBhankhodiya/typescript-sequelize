import Device from "../models/Device.js";
import type { Request, Response } from "express";
import User from "../models/User.js";
import Site from "../models/Site.js";
import DeviceStatus from "../models/Device_status.js";
import LoggerDeviceData from "../models/Logger_device_data.js";

import {
  handleRequest,
  validateId,
  findOrFail,
} from "../services/controllerService.js";

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device management APIs
 */

// GET ALL DEVICES

/**
 * @swagger
 * /api/admin/devices:
 *   get:
 *     summary: Get all devices
 *     tags: [Devices]
 *     responses:
 *       200:
 *         description: List of devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Device'
 *       500:
 *         description: Internal server error
 */

export const getAllDevices = handleRequest(
  async (_: Request, res: Response) => {
    const devices = await Device.findAll();
    res.status(200).json({ data: devices });
  },
);

// CREATE DEVICE

/**
 * @swagger
 * /api/admin/devices:
 *   post:
 *     summary: Create a new device
 *     tags: [Devices]
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
 *               device_type:
 *                 type: string
 *                 example: sensor
 *               device_name:
 *                 type: string
 *                 example: Temperature Sensor
 *               binded:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Device'
 *       500:
 *         description: Internal server error
 */

export const createDevice = handleRequest(
  async (req: Request, res: Response) => {
    const device = await Device.create({
      device_id: req.body.device_id,
      device_type: req.body.device_type,
      device_name: req.body.device_name,
      binded: req.body.binded,
    });
    res.status(201).json({ data: device });
  },
);

// GET DEVICE BY ID

/**
 * @swagger
 * /api/admin/devices/{id}:
 *   get:
 *     summary: Get device by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */

export const getDeviceById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);
    const device = await findOrFail(Device, id, "Device not found");
    res.status(200).json({ data: device });
  },
);

// UPDATE DEVICE

/**
 * @swagger
 * /api/admin/devices/{id}:
 *   put:
 *     summary: Update device
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_id:
 *                 type: string
 *               device_type:
 *                 type: string
 *               device_name:
 *                 type: string
 *               binded:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Device updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */

export const updateDevice = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);
    const device = await findOrFail(Device, id, "Device not found");

    await device.update(req.body);

    res.status(200).json({
      message: "Device updated successfully",
      data: device,
    });
  },
);

// DELETE DEVICE

/**
 * @swagger
 * /api/admin/devices/{id}:
 *   delete:
 *     summary: Delete device
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device deleted successfully
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */

export const deleteDevice = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);
    const device = await findOrFail(Device, id, "Device not found");

    await device.destroy();

    res.json({
      message: "Device deleted successfully",
    });
  },
);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

// GET ALL USERS

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

export const getAllUsers = handleRequest(async (_: Request, res: Response) => {
  const users = await User.findAll();
  res.status(200).json({ data: users });
});

// CREATE USER

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: abc123
 *               email:
 *                 type: string
 *                 example: abc@gmail.com
 *               password:
 *                 type: string
 *                 example: MySecurePassword123
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               first_name:
 *                 type: string
 *                 example: abc
 *               last_name:
 *                 type: string
 *                 example: xyz
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

export const createUser = handleRequest(async (req: Request, res: Response) => {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    role: req.body.role,
  });
  res.status(201).json({ data: user });
});

// GET USER BY ID

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export const getUserById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);
    const user = await findOrFail(User, id, "User not found");

    res.status(200).json({ data: user });
  },
);

// UPDATE USER

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: abc123
 *               email:
 *                 type: string
 *                 example: abc@gmail.com
 *               password:
 *                 type: string
 *                 example: MySecurePassword123
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               first_name:
 *                 type: string
 *                 example: abc
 *               last_name:
 *                 type: string
 *                 example: xyz
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export const updateUser = handleRequest(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const user = await findOrFail(User, id, "User not found");

  await user.update(req.body);

  res.status(200).json({
    message: "User updated successfully",
    data: user,
  });
});

// DELETE USER

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export const deleteUser = handleRequest(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const user = await findOrFail(User, id, "User not found");

  await user.destroy();

  res.json({
    message: "User deleted successfully",
  });
});

/**
 * @swagger
 * tags:
 *   name: Sites
 *   description: Site management APIs
 */

// GET ALL SITES

/**
 * @swagger
 * /api/admin/sites:
 *   get:
 *     summary: Get all sites
 *     tags: [Sites]
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

export const getAllSites = handleRequest(async (_: Request, res: Response) => {
  const sites = await Site.findAll();
  res.status(200).json({ data: sites });
});

// CREATE SITE

/**
 * @swagger
 * /api/admin/sites:
 *   post:
 *     summary: Create a new site
 *     tags: [Sites]
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
    site_devices: req.body.site_devices,
    site_owner: req.body.site_owner,
  });
  res.status(201).json({ data: site });
});

// GET SITE BY ID

/**
 * @swagger
 * /api/admin/sites/{id}:
 *   get:
 *     summary: Get site by ID
 *     tags: [Sites]
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
 * /api/admin/sites/{id}:
 *   put:
 *     summary: Update site
 *     tags: [Sites]
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
 * /api/admin/sites/{id}:
 *   delete:
 *     summary: Delete site
 *     tags: [Sites]
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

  res.json({
    message: "Site deleted successfully",
  });
});

/**
 * @swagger
 * tags:
 *   name: Device_data
 *   description: Device data management APIs
 */

// GET DEVICE DATA

/**
 * @swagger
 * /api/admin/device/data:
 *   get:
 *     summary: Get all device data
 *     tags: [Device_data]
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
  async (_: Request, res: Response) => {
    const data = await LoggerDeviceData.findAll();
    res.status(200).json({ data: data });
  },
);

// GET DEVICE DATA BY ID

/**
 * @swagger
 * /api/admin/device/data/{id}:
 *   get:
 *     summary: Get device data by ID
 *     tags: [Device_data]
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
      "Device not found",
    );

    res.status(200).json({ data: deviceData });
  },
);

// CREATE DEVICE DATA

/**
 * @swagger
 * /api/admin/device/data:
 *   post:
 *     summary: Create a new device's data
 *     tags: [Device_data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_uuid:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               device_id:
 *                 type: string
 *                 example: "DEV123456"
 *               raw_data:
 *                 type: string
 *                 example: xyz
 *               data:
 *                 type: object
 *                 example: {}
 *               site_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Device's data created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/LoggerDeviceData'
 *       500:
 *         description: Internal server error
 */

export const createDeviceData = handleRequest(
  async (req: Request, res: Response) => {
    const deviceData = await LoggerDeviceData.create({
      device_uuid: req.body.device_uuid,
      device_id: req.body.device_id,
      raw_data: req.body.raw_data,
      data: req.body.data,
      site_id: req.body.site_id,
    });
    res.status(201).json({ data: deviceData });
  },
);

// UPDATE DEVICE DATA

/**
 * @swagger
 * /api/admin/device/data/{id}:
 *   put:
 *     summary: Update device's data
 *     tags: [Device_data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_uuid:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               device_id:
 *                 type: string
 *                 example: "DEV123456"
 *               raw_data:
 *                 type: string
 *                 example: xyz
 *               data:
 *                 type: object
 *                 example: {}
 *               site_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Device's data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device's data updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/DeviceData'
 *       404:
 *         description: Device's data not found
 *       500:
 *         description: Internal server error
 */

export const updateDeviceData = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const deviceData = await findOrFail(
      LoggerDeviceData,
      id,
      "Device not found",
    );

    await deviceData.update(req.body);

    res.status(200).json({
      message: "Device's Data updated successfully",
      data: deviceData,
    });
  },
);

// DELETE DEVICE DATA

/**
 * @swagger
 * /api/admin/device/data/{id}:
 *   delete:
 *     summary: Delete device's data
 *     tags: [Device_data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device's data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device's data deleted successfully
 *       404:
 *         description: Device's data not found
 *       500:
 *         description: Internal server error
 */

export const deleteDeviceData = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const device = await findOrFail(LoggerDeviceData, id, "Device not found");

    await device.destroy();

    res.json({
      message: "Device's Data deleted successfully",
    });
  },
);

/**
 * @swagger
 * tags:
 *   name: Device_status
 *   description: Device status management APIs
 */

// GET ALL DEVICE STATUS

/**
 * @swagger
 * /api/admin/device/status:
 *   get:
 *     summary: Get all device status
 *     tags: [Device_status]
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
  async (_: Request, res: Response) => {
    const data = await DeviceStatus.findAll();
    res.status(200).json({ data: data });
  },
);

// GET DEVICE STATUS BY ID

/**
 * @swagger
 * /api/admin/device/status/{id}:
 *   get:
 *     summary: Get device status by ID
 *     tags: [Device_status]
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

    const deviceStatus = await findOrFail(DeviceStatus, id, "Device not found");

    res.status(200).json({ data: deviceStatus });
  },
);

// CREATE DEVICE STATUS DATA

/**
 * @swagger
 * /api/admin/device/status:
 *   post:
 *     summary: Create a new device's status
 *     tags: [Device_status]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_uuid:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               device_id:
 *                 type: string
 *                 example: "DEV123456"
 *               device_status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: inactive
 *     responses:
 *       201:
 *         description: Device's status created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeviceStatus'
 *       500:
 *         description: Internal server error
 */

export const createDeviceStatus = handleRequest(
  async (req: Request, res: Response) => {
    const deviceStatus = await DeviceStatus.create({
      device_uuid: req.body.device_uuid,
      device_id: req.body.device_id,
      device_status: req.body.device_status,
    });
    res.status(201).json({ data: deviceStatus });
  },
);

// UPDATE DEVICE STATUS

/**
 * @swagger
 * /api/admin/device/status/{id}:
 *   put:
 *     summary: Update device's status
 *     tags: [Device_status]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_uuid:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               device_id:
 *                 type: string
 *                 example: "DEV123456"
 *               device_status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: inactive
 *     responses:
 *       200:
 *         description: Device's status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device's status updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/DeviceStatus'
 *       404:
 *         description: Device's status not found
 *       500:
 *         description: Internal server error
 */

export const updateDeviceStatus = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const deviceStatus = await findOrFail(DeviceStatus, id, "Device not found");

    await deviceStatus.update(req.body);

    res.status(200).json({
      message: "Device Status updated successfully",
      data: deviceStatus,
    });
  },
);

// DELETE DEVICE STATUS

/**
 * @swagger
 * /api/admin/device/status/{id}:
 *   delete:
 *     summary: Delete device's status
 *     tags: [Device_status]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device's status deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device's status deleted successfully
 *       404:
 *         description: Device's status not found
 *       500:
 *         description: Internal server error
 */

export const deleteDeviceStatus = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const deviceStatus = await findOrFail(DeviceStatus, id, "Device not found");

    await deviceStatus.destroy();

    res.json({
      message: "Device's Status deleted successfully",
    });
  },
);
