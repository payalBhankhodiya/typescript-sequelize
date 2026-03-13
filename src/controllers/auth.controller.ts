import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sendTokenResponse } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

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
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      phone,
      first_name,
      last_name,
      role: role && role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
    });

    return sendTokenResponse(user, res);
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
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
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Fetch user WITH password explicitly
    const user = await User.scope("withPassword").findOne({ where: { email } });

    console.log("USER:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Ensure password is available
    const hashedPassword = user.getDataValue("password");
    console.log("hashedPassword : ", hashedPassword);

    if (!hashedPassword) {
      console.error("Password missing in DB:", user.get({ plain: true }));
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return sendTokenResponse(user, res);
  } catch (error: any) {
    console.error("Signin error:", error);
    return res.status(500).json({
      message: "Internal Server error",
      error: error.message,
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
      return res.status(400).json({ message: "No token found" });
    }

    // Decode token safely
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      role: string;
    };

    const userId = decoded.id;
    const role = decoded.role;

    // Clear cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      message: `Logged out successfully`,
      userId,
      role,
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
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
