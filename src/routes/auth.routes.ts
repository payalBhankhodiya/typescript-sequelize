import { Router } from "express";
import { logout, signin, signup } from "../controllers/auth.controller.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  logoutSchema,
} from "../validation/user.js";

const router = Router();

router.post("/signup", validateRequest(registerSchema), signup);

router.post("/signin", validateRequest(loginSchema), signin);

router.post("/logout", validateRequest(logoutSchema), logout);

export default router;
