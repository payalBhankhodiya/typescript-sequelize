import { Router } from "express";
import { liveDeviceData, loggerDevice, replaceDevice, unbindDevice } from "../controllers/device.controller.js";



const router = Router();

router.post("/logger", loggerDevice);
router.get("/live", liveDeviceData);
router.post("/unbind/:device_uuid", unbindDevice);
router.post("/replace", replaceDevice);

export default router;

