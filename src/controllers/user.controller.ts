import type { Request, Response } from "express";
import sequelize from "../config/database.js";
import Device from "../models/Device.js";
import User from "../models/User.js";
import Site from "../models/Site.js";
import LoggerDeviceData from "../models/Logger_device_data.js";
import DeviceStatus from "../models/Device_status.js";

// CREATE SITE
export const createSite = async (req: Request, res: Response) => {
  try {
    const site = await Site.create(req.body);
    return res.status(201).json({ data: site });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to create site", details: error });
  }
};

// GET ALL SITES
export const getAllSites = async (req: Request, res: Response) => {
  try {
    const sites = await Site.findAll();
    return res.status(200).json({ data: sites });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch sites" });
  }
};

// GET SITE BY ID
export const getSiteById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid site ID" });
    }

    const site = await Site.findByPk(id);

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    return res.status(200).json({ data: site });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching site" });
  }
};

// UPDATE SITE
export const updateSite = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid site ID" });
    }

    const site = await Site.findByPk(id);

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    await site.update(req.body);
    return res
      .status(200)
      .json({ message: "Site updated successfully!", data: site });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update site" });
  }
};

// DELETE SITE
export const deleteSite = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid site ID" });
    }

    const site = await Site.findByPk(id);

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    await site.destroy();
    return res.json({ message: "Site deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete site" });
  }
};

// GET DEVICE DATA
export const getAllDeviceData = async (req: Request, res: Response) => {
  try {
    const data = await LoggerDeviceData.findAll();
    return res.status(200).json({ data: data });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch devices data" });
  }
};

// GET DEVICE DATA BY ID
export const getDeviceDataById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const deviceData = await LoggerDeviceData.findByPk(id);

    if (!deviceData) {
      return res.status(404).json({ message: "Device not found" });
    }

    return res.status(200).json({ data: deviceData });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching device" });
  }
};

// GET DEVICE STATUS
export const getAllDeviceStatus = async (req: Request, res: Response) => {
  try {
    const data = await DeviceStatus.findAll();
    return res.status(200).json({ data: data });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch devices status" });
  }
};

// GET DEVICE STATUS BY ID
export const getDeviceStatusById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const deviceStatus = await DeviceStatus.findByPk(id);

    if (!deviceStatus) {
      return res.status(404).json({ message: "Device not found" });
    }

    return res.status(200).json({ data: deviceStatus });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching device" });
  }
};

// binds device
export const bindDevice = async (req: Request, res: Response) => {
  const { user_id, device_id, site_id } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(Number(user_id), { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const site = await Site.findOne({
      where: { site_id: String(site_id) },
      transaction,
    });

    if (!site) {
      await transaction.rollback();
      return res.status(404).json({ message: "Site not found" });
    }

    const device = await Device.findOne({
      where: { device_id: String(device_id) },
      transaction,
    });

    if (!device) {
      await transaction.rollback();
      return res.status(404).json({ message: "Device not found" });
    }

    if (device.binded) {
      await transaction.rollback();
      return res.status(400).json({ message: "Device already binded" });
    }

    await device.update(
      {
        binded: true,
        binded_to: Number(user_id),
        binded_at: String(site_id),
      },
      { transaction },
    );

    await transaction.commit();

    const updatedDevice = await Device.findOne({
      where: { device_id: String(device_id) },
    });

    return res.status(200).json({
      message: "Device binded successfully",
      device: updatedDevice,
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const findDevice = async (req: Request, res: Response) => {
  const { device_id, raw_data, data } = req.body;

  const transaction = await sequelize.transaction();

  try {
    if (!device_id) {
      return res.status(400).json({ message: "device_id is required" });
    }

    const device = await Device.findOne({
      where: { device_id },
      transaction,
    });

    if (!device) {
      await transaction.rollback();
      return res.status(404).json({ message: "Device not found" });
    }

    const deviceData = device.get({ plain: true });

    // Correct validation
    if (!deviceData.binded || !deviceData.binded_at) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Device is not binded to any site",
      });
    }

    // LOGGER LOGIC
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

    await transaction.commit();

    return res.status(200).json({
      message: "Device data processed successfully",
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error("ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
