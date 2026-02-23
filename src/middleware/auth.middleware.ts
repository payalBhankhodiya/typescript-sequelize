import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET as string;

if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}



export interface AuthRequest extends Request {
  user?: JwtPayload & {
    userId: number;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const token = req.cookies?.authcookie;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload & {
      userId: number;
      email: string;
    };

    req.user = decoded;

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
      error: error.message,
    });
  }
};