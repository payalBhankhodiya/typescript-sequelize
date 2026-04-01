import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Not have access token" });
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
    ) as {
      id: number;
      role: string;
    };

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user.toJSON();
    next();
  } catch (error: any) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};
export const protectAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Not have access token" });
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
    ) as {
      id: number;
      role: string;
    };

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userObj = user.toJSON();
    if (userObj.role !== "ADMIN") {
      return res.status(401).json({ message: "Not an admin" });
    }
    req.user = userObj;
    next();
  } catch (error: any) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};
