import { Router } from "express";
import {
  bindDevice,
  createSite,
  deleteSite,
  getAllDeviceData,
  getAllDeviceStatus,
  getAllSites,
  getDeviceDataById,
  getDeviceStatusById,
  getSiteById,
  updateSite,
} from "../controllers/user.controller.js";

const router = Router();

// Site
router.get("/sites", getAllSites);
router.get("/sites/:id", getSiteById);
router.post("/sites", createSite);
router.put("/sites/:id", updateSite);
router.delete("/sites/:id", deleteSite);

// Device Data
router.get("/device/data", getAllDeviceData);
router.get("/device/data/:id", getDeviceDataById);

// Device Status
router.get("/device/status", getAllDeviceStatus);
router.get("/device/status/:id", getDeviceStatusById);


router.post("/binds/device",bindDevice);
export default router;
