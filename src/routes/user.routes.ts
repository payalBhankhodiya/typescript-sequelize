import { Router } from "express";
import {
  bindDevice,
  createSite,
  deleteSite,
  findDevice,
  getAllDeviceData,
  getAllDeviceStatus,
  getAllSites,
  getDeviceDataById,
  getDeviceStatusById,
  getSiteById,
  updateSite,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Site
router.get("/sites", protect, getAllSites);
router.get("/sites/:id", protect, getSiteById);
router.post("/sites", protect, createSite);
router.put("/sites/:id", protect, updateSite);
router.delete("/sites/:id", protect, deleteSite);

// Device Data
router.get("/device/data", protect, getAllDeviceData);
router.get("/device/data/:id", protect, getDeviceDataById);

// Device Status
router.get("/device/status", protect, getAllDeviceStatus);
router.get("/device/status/:id", protect, getDeviceStatusById);

// bind device
router.post("/binds/device", protect, bindDevice);

// find device
router.post("/find/device", protect, findDevice);

export default router;












