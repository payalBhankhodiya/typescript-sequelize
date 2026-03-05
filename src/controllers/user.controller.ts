import type { Request, Response } from "express";
import sequelize from "../config/database.js";
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

// CREATE SITE
export const createSite = handleRequest(async (req: Request, res: Response) => {
  const site = await Site.create(req.body);
  res.status(201).json({ data: site });
});

// GET ALL SITES
export const getAllSites = handleRequest(
  async (req: Request, res: Response) => {
    const sites = await Site.findAll();
    res.status(200).json({ data: sites });
  },
);

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

  res.json({ message: "Site deleted successfully" });
});

// GET DEVICE DATA
export const getAllDeviceData = handleRequest(
  async (req: Request, res: Response) => {
    const data = await LoggerDeviceData.findAll();
    res.status(200).json({ data });
  },
);

// GET DEVICE DATA BY ID
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

// GET DEVICE STATUS
export const getAllDeviceStatus = handleRequest(
  async (req: Request, res: Response) => {
    const data = await DeviceStatus.findAll();
    res.status(200).json({ data });
  },
);

// GET DEVICE STATUS BY ID
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

// binds device
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
