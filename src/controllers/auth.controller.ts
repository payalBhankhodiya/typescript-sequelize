import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import LogUser from "../models/Log_user.js";
import { sendTokenResponse } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await LogUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password manually 
    // salt = 10
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await LogUser.create({
      username,
      email,
      password: hashedPassword,
      role: role && role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
    });

    return sendTokenResponse(user, res);
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message || String(error),
    });
  }
};





export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Fetch user WITH password explicitly
    const user = await LogUser.scope("withPassword").findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Ensure password is available
    const hashedPassword = user.getDataValue("password"); 
    if (!hashedPassword) {
      console.error("Password missing in DB:", user.get({ plain: true }));
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return sendTokenResponse(user, res);
  } catch (error: any) {
    console.error("Signin error:", error);
    return res.status(500).json({
      message: "Internal Server error",
      error: error.message || String(error),
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token; 
    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }

    // Decode token safely
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: string };

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
      error: error.message || String(error),
    });
  }
};
