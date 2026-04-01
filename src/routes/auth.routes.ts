import { Router } from "express";
import {
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  signin,
  signup,
  updatePassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
  verifyEmailSchema,
} from "../validation/user.js";

const router = Router();

router.post("/signup", validateRequest(registerSchema), signup);
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);

router.post("/signin", validateRequest(loginSchema), signin);

router.post("/logout", logout);

router.post(
  "/update-password",
  validateRequest(updatePasswordSchema),
  updatePassword,
);

router.post(
  "/request-password-reset",
  validateRequest(requestPasswordResetSchema),
  requestPasswordReset,
);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword,
);

router.post("/refresh-token", refreshAccessToken);

export default router;
