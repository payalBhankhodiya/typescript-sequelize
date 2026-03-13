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

import { protectAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Device
router.get("/devices", protectAdmin, getAllDevices);
router.get("/devices/:id", protectAdmin, getDeviceById);
router.post("/devices", protectAdmin, createDevice);
router.put("/devices/:id", protectAdmin, updateDevice);
router.delete("/devices/:id", protectAdmin, deleteDevice);

// User
router.get("/users", protectAdmin, getAllUsers);
router.get("/users/:id", protectAdmin, getUserById);
router.post("/users", protectAdmin, createUser);
router.put("/users/:id", protectAdmin, updateUser);
router.delete("/users/:id", protectAdmin, deleteUser);

// Site
router.get("/sites", protectAdmin, getAllSites);
router.get("/sites/:id", protectAdmin, getSiteById);
router.post("/sites", protectAdmin, createSite);
router.put("/sites/:id", protectAdmin, updateSite);
router.delete("/sites/:id", protectAdmin, deleteSite);

// Device Data
router.get("/device/data", protectAdmin, getAllDeviceData);
router.get("/device/data/:id", protectAdmin, getDeviceDataById);
router.post("/device/data", protectAdmin, createDeviceData);
router.put("/device/data/:id", protectAdmin, updateDeviceData);
router.delete("/device/data/:id", protectAdmin, deleteDeviceData);

// Device Status
router.get("/device/status", protectAdmin, getAllDeviceStatus);
router.get("/device/status/:id", protectAdmin, getDeviceStatusById);
router.post("/device/status", protectAdmin, createDeviceStatus);
router.put("/device/status/:id", protectAdmin, updateDeviceStatus);
router.delete("/device/status/:id", protectAdmin, deleteDeviceStatus);

export default router;


