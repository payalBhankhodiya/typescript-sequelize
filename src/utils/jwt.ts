import jwt from "jsonwebtoken";
import type { Response } from "express";

export const sendTokenResponse = (user: any, res: Response) => {
  console.log("Token Payload:", { id: user.dataValues.id, role: user.dataValues.role });

  const token = jwt.sign(
    { id: user.dataValues.id, role: user.dataValues.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "24h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  const safeUser = { ...user.get() };
  delete safeUser.password;

  return res.status(200).json({
    success: true,
    message: "Success",
    user: safeUser,
  });
};



