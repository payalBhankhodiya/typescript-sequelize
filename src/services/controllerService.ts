import type { Request, Response } from "express";
import sequelize from "../db/connection.js";

export const handleRequest =
  (fn: Function) => async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

export const validateId = (id: any) => {
  const num = Number(id);
  if (isNaN(num)) throw new Error("Invalid ID");
  return num;
};

export const findOrFail = async (model: any, id: number, message: string) => {
  const record = await model.findByPk(id);

  if (!record) {
    const error: any = new Error(message);
    error.status = 404;
    throw error;
  }
  return record;
};

export const findOwnedOrFail = async (
  model: any,
  where: any,
  userId: number,
  message: string
) => {
  const record = await model.findOne({
    where: {
      ...where,
      site_owner: userId, 
    },
  });

  if (!record) {
    const error: any = new Error(message);
    error.status = 404;
    throw error;
  }
  return record;
};

export const withTransaction = async (callback: any) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
