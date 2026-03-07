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

// GET ALL DEVICES
export const getAllDevices = handleRequest(
  async (_: Request, res: Response) => {
    const devices = await Device.findAll();
    res.status(200).json({ data: devices });
  },
);

// CREATE DEVICE
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
export const getDeviceById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const device = await findOrFail(Device, id, "Device not found");

    res.status(200).json({ data: device });
  },
);

// UPDATE DEVICE
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

// GET ALL USERS
export const getAllUsers = handleRequest(async (_: Request, res: Response) => {
  const users = await User.findAll();
  res.status(200).json({ data: users });
});

// CREATE USER
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
export const getUserById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const user = await findOrFail(User, id, "User not found");

    res.status(200).json({ data: user });
  },
);

// UPDATE USER
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
export const deleteUser = handleRequest(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

  const user = await findOrFail(User, id, "User not found");

  await user.destroy();

  res.json({
    message: "User deleted successfully",
  });
});

// GET ALL SITES
export const getAllSites = handleRequest(async (_: Request, res: Response) => {
  const sites = await Site.findAll();
  res.status(200).json({ data: sites });
});

// CREATE SITE
export const createSite = handleRequest(async (req: Request, res: Response) => {
  const site = await Site.create({
    site_id: req.body.site_id,
    site_address: req.body.site_address,
    site_type: req.body.site_type,
    site_owner: req.body.site_owner,
  });
  res.status(201).json({ data: site });
});

// GET SITE BY ID
export const getSiteById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const site = await findOrFail(Site, id, "Site not found");

    res.status(200).json({ data: site });
  },
);

// UPDATE SITE
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
export const deleteSite = handleRequest(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

  const site = await findOrFail(Site, id, "Site not found");

  await site.destroy();

  res.json({
    message: "Site deleted successfully",
  });
});

// GET DEVICE DATA

export const getAllDeviceData = handleRequest(
  async (_: Request, res: Response) => {
    const data = await LoggerDeviceData.findAll();
    res.status(200).json({ data: data });
  },
);

// GET DEVICE DATA BY ID

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

// CREATE DEVICE's DATA

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

// UPDATE DEVICE's DATA

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

// DELETE DEVICE's DATA

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

// GET ALL DEVICE STATUS

export const getAllDeviceStatus = handleRequest(
  async (_: Request, res: Response) => {
    const data = await DeviceStatus.findAll();
    res.status(200).json({ data: data });
  },
);

// GET DEVICE STATUS BY ID

export const getDeviceStatusById = handleRequest(
  async (req: Request, res: Response) => {
    const id = validateId(req.params.id);

    const deviceStatus = await findOrFail(DeviceStatus, id, "Device not found");

    res.status(200).json({ data: deviceStatus });
  },
);

// CREATE DEVICE STATUS DATA

export const createDeviceStatus = handleRequest(
  async (req: Request, res: Response) => {
    const deviceStatus = await DeviceStatus.create({
      device_uuid: req.body.device_uuid,
      device_id: req.body.device_id,
      device_status: req.body.device_status
    });
    res.status(201).json({ data: deviceStatus });
  },
);

// UPDATE DEVICE's STATUS

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

// DELETE DEVICE's STATUS

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
