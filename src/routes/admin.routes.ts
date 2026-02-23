import { Router } from "express";
import {
  createDevice,
  createDeviceData,
  createDeviceStatus,
  createSite,
  createUser,
  deleteDevice,
  deleteDeviceData,
  deleteDeviceStatus,
  deleteSite,
  deleteUser,
  getAllDeviceData,
  getAllDevices,
  getAllDeviceStatus,
  getAllSites,
  getAllUsers,
  getDeviceById,
  getDeviceDataById,
  getDeviceStatusById,
  getSiteById,
  getUserById,
  updateDevice,
  updateDeviceData,
  updateDeviceStatus,
  updateSite,
  updateUser,
} from "../controllers/admin.controller.js";

const router = Router();

// Device
router.get("/devices", getAllDevices);
router.get("/devices/:id", getDeviceById);
router.post("/devices", createDevice);
router.put("/devices/:id", updateDevice);
router.delete("/devices/:id", deleteDevice);

// User
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Site
router.get("/sites", getAllSites);
router.get("/sites/:id", getSiteById);
router.post("/sites", createSite);
router.put("/sites/:id", updateSite);
router.delete("/sites/:id", deleteSite);

// Device Data
router.get("/device/data", getAllDeviceData);
router.get("/device/data/:id", getDeviceDataById);
router.post("/device/data", createDeviceData);
router.put("/device/data/:id", updateDeviceData);
router.delete("/device/data/:id", deleteDeviceData);

// Device Status
router.get("/device/status", getAllDeviceStatus);
router.get("/device/status/:id", getDeviceStatusById);
router.post("/device/status", createDeviceStatus);
router.put("/device/status/:id", updateDeviceStatus);
router.delete("/device/status/:id", deleteDeviceStatus);

export default router;
