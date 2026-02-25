import jwt from "jsonwebtoken";
import type { Response } from "express";

export const sendTokenResponse = (user: any, res: Response) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "24h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Remove password from response
  const safeUser = { ...user.get() };
  delete safeUser.password;

  return res.status(200).json({
    success: true,
    message: "Success",
    user: safeUser,
  });
};