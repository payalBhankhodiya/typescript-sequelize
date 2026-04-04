import type { Request, Response, NextFunction } from "express";
import { handleRateLimit } from "../utils/rateLimitHandler.js";

const LIMIT = 3;
const WINDOW_SEC = 1 * 60;

export const userRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const key = `rate_limit:user:${userId}`;

    const result = await handleRateLimit(key, LIMIT, WINDOW_SEC);

    if (result.blocked) {
      return res.status(429).json({
        message: "Too many requests (User)",
        retryAfter: result.ttl,
      });
    }

    next();
  } catch (err) {
    console.error("User rate limiter error:", err);
    next();
  }
};
