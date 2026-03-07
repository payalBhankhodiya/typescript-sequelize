import * as dotenv from "dotenv";
import Joi from "joi";
import type { Dialect } from "sequelize";

dotenv.config();

const envSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_TYPE: Joi.string()
    .valid("mysql", "postgres", "sqlite", "mariadb", "mssql")
    .required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().default(3000),
}).unknown();

const { error } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const dbConfig = {
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: process.env.DB_TYPE as Dialect,
  database: process.env.DB_NAME as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
};
