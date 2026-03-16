import { Router } from "express";
import { loggerDevice } from "../controllers/device.controller.js";



const router = Router();

router.post("/logger", loggerDevice);

export default router;