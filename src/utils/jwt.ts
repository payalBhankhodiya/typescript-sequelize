import jwt from "jsonwebtoken";
import type { Response } from "express";
import redisClient from "../config/redis.js";
import bcrypt from "bcrypt";

export const sendTokenResponse = async (user: any, res: Response) => {
  const { id, role } = user.get();

  const payload = { id, role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "5m",
  });

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "1d" },
  );

  const hashed = await bcrypt.hash(refreshToken, 10);

  await redisClient.set(`refreshToken:${id}`, hashed, {
    EX: 60 * 60 * 24, // 1 day
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });

  const safeUser = { ...user.get() };
  delete safeUser.password;

  return res.status(200).json({
    success: true,
    message: "Success",
    user: safeUser,
  });
};
