import { Router } from "express";
import { logout, requestPasswordReset, resetPassword, signin, signup, updatePassword, verifyEmail } from "../controllers/auth.controller.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  logoutSchema,
  resetPasswordSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
} from "../validation/user.js";



const router = Router();

router.post("/signup", validateRequest(registerSchema), signup);
router.post("/verify-email", verifyEmail);

router.post("/signin", validateRequest(loginSchema), signin);

router.post("/logout", validateRequest(logoutSchema), logout);

router.post("/update-password", validateRequest(updatePasswordSchema), updatePassword);

router.post("/request-password-reset", validateRequest(requestPasswordResetSchema), requestPasswordReset);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);


export default router;
