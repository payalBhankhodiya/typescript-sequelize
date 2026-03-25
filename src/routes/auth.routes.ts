import { Router } from "express";
import { logout, signin, signup, updatePassword } from "../controllers/auth.controller.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  logoutSchema,
} from "../validation/user.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", validateRequest(registerSchema), signup);

router.post("/signin", validateRequest(loginSchema), signin);

router.post("/logout", validateRequest(logoutSchema), logout);

router.post("/update-password", protect, updatePassword);

export default router;
