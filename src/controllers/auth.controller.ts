import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import LogUser from "../models/Log_user.js";
import bcrypt from "bcrypt";

dotenv.config();

const secret = process.env.JWT_SECRET as string;

if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

interface SignupBody {
  username: string;
  email: string;
  password: string;
}

interface SigninBody {
  email: string;
  password: string;
}

export const signup = async (
  req: Request<{}, {}, SignupBody>,
  res: Response,
): Promise<Response> => {
  try {
    const { username, email, password } = req.body;

    const user = await LogUser.create({
      username,
      email,
      password,
    });

    const plainUser = user.toJSON();

    return res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: plainUser.id,
        username: plainUser.username,
        email: plainUser.email,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const signin = async (
  req: Request<{}, {}, SigninBody>,
  res: Response,
): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await LogUser.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
      expiresIn: "24h",
    });

    res.cookie("authcookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logout = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    res.clearCookie("authcookie", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
