import type { Request, Response } from "express";
import Device from "../models/Device.js";
import LoggerDeviceData from "../models/Logger_device_data.js";
import { handleRequest } from "../services/controllerService.js";

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

    return res.status(201).json({
      message: "Logger device data stored successfully",
      data: deviceData,
    });
  }
);