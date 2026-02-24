import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import LogUser from "../models/Log_user.js";
import { sendTokenResponse } from "../utils/sendTokenResponse.js";

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

    const user = await LogUser.create({
      username,
      email,
      password,
      role: role && role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
    });

    return sendTokenResponse(user, res);
  } catch (error: any) {
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
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await LogUser.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      console.error("Fetched user from DB:", user.get());
      return res
        .status(500)
        .json({ message: "Password not set for this user" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
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

export const logout = async (_req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};
