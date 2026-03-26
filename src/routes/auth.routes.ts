import { Router } from "express";
import { logout, requestPasswordReset, resetPassword, signin, signup, updatePassword } from "../controllers/auth.controller.js";
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

router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);


export default router;
