import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sendTokenResponse } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import crypto from "crypto";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
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

    const user = await User.create({
      username,
      email,
      password,
      phone,
      first_name,
      last_name,
      role: role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
    });

    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
    });

    return sendTokenResponse(user, res);
  } catch (error: any) {
    logger.error("Signup error", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and returns authentication token in cookie
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
 *                 example: abc
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abc@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               first_name:
 *                 type: string
 *                 example: abc
 *               last_name:
 *                 type: string
 *                 example: xyz
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: USER
 *     responses:
 *       200:
 *         description: User registered successfully and token returned
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
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User already exists
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

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !currentPassword || !newPassword) {
      logger.warn("Updating password failed", { userId });
      return res.status(400).json({ message: "All fields are required" });
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

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      logger.warn("email failed", { email });
      return res.status(400).json({ message: "email field is required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await user.update({
      resetToken: token,
      resetTokenExpiry: expiry,
    });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    res.json({
      message: "Reset link generated",
      resetLink, // for testing only
    });
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

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: {
        resetToken: token,
      },
    });
      
     

    if (!user || !user.dataValues.resetTokenExpiry) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.dataValues.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

     const user2 = await User.scope("withPassword").findOne({
      where: { password: hashedPassword },
    });
    console.log(user2?.dataValues)
    res.json({ message: "Password reset successful" });
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
