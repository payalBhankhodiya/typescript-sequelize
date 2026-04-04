import type { Request, Response, NextFunction } from "express";
import { handleRateLimit } from "../utils/rateLimitHandler.js";

const LIMIT = 3;
const WINDOW_SEC = 1 * 60;     // this variable stored time in sec so here, 1 * 60 = 60 sec

export const ipRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip;
    const key = `rate_limit:ip:${ip}`;

    const result = await handleRateLimit(key, LIMIT, WINDOW_SEC);

    if (result.blocked) {
      return res.status(429).json({
        message: "Too many requests (IP)",
        retryAfter: result.ttl,
      });
    }

    next();
  } catch (err) {
    console.error("IP rate limiter error:", err);
    next(); 
  }
};