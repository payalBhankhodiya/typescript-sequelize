import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sendTokenResponse } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import crypto from "crypto";
import transporter from "../services/email.js";
import { Op } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

// signup

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account, sends email verification link, and returns authentication token in cookie.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - phone
 *               - first_name
 *               - last_name
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: USER
 *                 description: Defaults to USER if not ADMIN
 *     responses:
 *       201:
 *         description: Signup successful, verification email sent
 *         headers:
 *           Set-Cookie:
 *             description: Authentication token stored in cookie
 *             schema:
 *               type: string
 *               example: token=abc123; HttpOnly; Path=/;
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signup successful. Please verify your email.
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     validationError:
 *                       value: All fields are required
 *                     userExists:
 *                       value: User already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server error
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, phone, first_name, last_name, role } =
      req.body;

    if (
      !username ||
      !email ||
      !password ||
      !phone ||
      !first_name ||
      !last_name ||
      !role
    ) {
      logger.warn("Signup validation failed", { body: req.body });

      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      logger.warn("Signup attempt with existing email", { email });

      return res.status(400).json({ message: "User already exists" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      username,
      email,
      password,
      phone,
      first_name,
      last_name,
      role: role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      isVerified: false,
    });

    const verifyLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      to: user.dataValues.email,
      subject: "Verify your email",
      html: `
        <h3>Email Verification</h3>
        <p>Click below link to verify your email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      `,
    });

    logger.info("User registered, verification email sent", {
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      message: "Signup successful. Please verify your email.",
    });

    return sendTokenResponse(user, res);
  } catch (error: any) {
    logger.error("Signup error", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

// verify email

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email
 *     description: Verifies a user's email using the verification token sent via email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "a1b2c3d4e5f6..."
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Email verified successfully ✅
 *       400:
 *         description: Invalid or expired verification token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unverified or expired token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server error
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Unverified or expired token" });
    }

    await user.update({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });

    return res.send("Email verified successfully ✅");
  } catch (error: any) {
    logger.error("Signin error", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

// signin

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: User login
 *     description: Authenticates a user using email and password and returns a token in cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abc@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: Authentication token stored in cookie
 *             schema:
 *               type: string
 *               example: token=jwt_token_value; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: abc
 *                     email:
 *                       type: string
 *                       example: abc@example.com
 *                     role:
 *                       type: string
 *                       example: USER
 *       400:
 *         description: Invalid credentials or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Internal server error
 */
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn("Signin validation failed", { email });

      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.scope("withPassword").findOne({ where: { email } });

    if (!user) {
      logger.warn("Signin failed - user not found", { email });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const hashedPassword = user.getDataValue("password");

    if (!hashedPassword) {
      logger.error("Password missing in DB", { userId: user.id });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      logger.warn("Signin failed - wrong password", {
        userId: user.id,
      });

      return res.status(400).json({ message: "Invalid credentials" });
    }

    logger.info("User logged in successfully", {
      userId: user.id,
      email: user.email,
    });

    return sendTokenResponse(user, res);
  } catch (error: any) {
    logger.error("Signin error", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

// logout

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears the authentication token stored in cookies and logs out the user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: Clears the authentication cookie
 *             schema:
 *               type: string
 *               example: token=; Path=/; Expires=timezone; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 role:
 *                   type: string
 *                   example: USER
 *       400:
 *         description: No token found in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No token found
 *       500:
 *         description: Internal server error
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Logout attempted without token");

      return res.status(400).json({ message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      role: string;
    };

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    logger.info("User logged out", {
      userId: decoded.id,
      role: decoded.role,
    });

    return res.status(200).json({
      message: `Logged out successfully`,
      userId: decoded.id,
      role: decoded.role,
    });
  } catch (error: any) {
    logger.error("Logout error", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// update password

/**
 * @swagger
 * /api/auth/update-password:
 *   put:
 *     summary: Update user password
 *     description: Allows an authenticated user to update their password by providing the current password.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 example: newSecurePassword456
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Bad request (missing fields or incorrect current password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingFields:
 *                       value: fields are required
 *                     wrongPassword:
 *                       value: Current password is incorrect
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server error
 */
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!currentPassword || !newPassword) {
      logger.warn("Updating password failed", { userId });
      return res.status(400).json({ message: "fields are required" });
    }

    const user = await User.scope("withPassword").findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const password = user.get("password") as string;

    if (!password) {
      logger.error("Password not fetched from DB", { userId });
      return res.status(500).json({ message: "Password not available" });
    }

    const isMatch = await bcrypt.compare(currentPassword, password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedPassword });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    logger.error("Update password error", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

// Request password reset

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset link to the user's email if the account exists.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset link sent to your email
 *       400:
 *         description: Missing email field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: email field is required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error or mail failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      logger.warn("email missing in request");
      return res.status(400).json({ message: "email field is required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await user.update({
      resetToken: hashedToken,
      resetTokenExpiry: expiry,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click below link to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.json({
      message: "Reset link sent to your email",
    });
  } catch (error: any) {
    logger.error("Something went wrong", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: error.message,
    });
  }
};

// reset password

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using a valid reset token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "f3a1c9d8e7b6a5..."
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123"
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server error
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return res.json({ message: "Password reset successful" });
  } catch (error: any) {
    logger.error("Something went wrong", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};
