import type { Request, Response } from "express";
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

// GET DEVICE STATUS
export const getAllDeviceStatus = async (req: Request, res: Response) => {
  try {
    const data = await DeviceStatus.findAll();
    return res.status(200).json({ data: data });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch devices status" });
  }
};

