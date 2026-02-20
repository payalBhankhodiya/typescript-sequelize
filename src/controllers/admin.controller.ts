import Device from "../models/Device.js";
import type { Request, Response } from "express";
import User from "../models/User.js";
import Site from "../models/Site.js";
import DeviceStatus from "../models/Device_status.js";
import LoggerDeviceData from "../models/Logger_device_data.js";


// GET ALL DEVICES
export const getAllDevices = async (req: Request, res: Response) => {
  try {
    const devices = await Device.findAll();
    return res.status(200).json({ data: devices });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Failed to fetch devices", error: error.message });
  }
};

// CREATE DEVICE
export const createDevice = async (req: Request, res: Response) => {
  try {
    const device = await Device.create(req.body);
    return res.status(201).json({ data: device });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to create device" });
  }
};

// GET DEVICE BY ID
export const getDeviceById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const device = await Device.findByPk(id);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    return res.status(200).json({ data: device });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching device" });
  }
};

// UPDATE DEVICE
export const updateDevice = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const device = await Device.findByPk(id);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await device.update(req.body);
    return res.status(200).json({ data: device });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update device" });
  }
};

// DELETE DEVICE
export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const device = await Device.findByPk(id);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await device.destroy();
    return res.json({ message: "Device deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete device" });
  }
};

// CREATE USER
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    return res.status(201).json({ data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to create user", details: error });
  }
};

// GET ALL USERS
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({ data: users });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

// GET USER BY ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching user" });
  }
};

// UPDATE USER
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update(req.body);
    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update user" });
  }
};

// DELETE USER
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user" });
  }
};


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
    return res.status(200).json({ data: site });
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

// CREATE DEVICE's DATA
export const createDeviceData = async (req: Request, res: Response) => {
  try {
    const deviceData = await LoggerDeviceData.create(req.body);
    return res.status(201).json({ data: deviceData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to create device's data" });
  }
};

// UPDATE DEVICE's DATA

export const updateDeviceData = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const deviceData = await LoggerDeviceData.findByPk(id);

    if (!deviceData) {
      return res.status(404).json({ message: "Device not found" });
    }

    await deviceData.update(req.body);
    return res.status(200).json({ data: deviceData });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update device data" });
  }
};

// DELETE DEVICE's DATA

export const deleteDeviceData = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const device = await LoggerDeviceData.findByPk(id);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await device.destroy();
    return res.json({ message: "Device's Data deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete device's data" });
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

// UPDATE DEVICE's STATUS

export const updateDeviceStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const deviceStatus = await DeviceStatus.findByPk(id);

    if (!deviceStatus) {
      return res.status(404).json({ message: "Device not found" });
    }

    await deviceStatus.update(req.body);
    return res.status(200).json({ data: deviceStatus });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update device status" });
  }
};

// DELETE DEVICE's STATUS

export const deleteDeviceStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const deviceStatus = await DeviceStatus.findByPk(id);

    if (!deviceStatus) {
      return res.status(404).json({ message: "Device not found" });
    }

    await deviceStatus.destroy();
    return res.json({ message: "Device's Status deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete device's status" });
  }
};