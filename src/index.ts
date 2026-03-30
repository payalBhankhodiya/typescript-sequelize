import app from "./app.js";
import sequelize from "./db/connection.js";
import logger from "./config/logger.js";
import { connectRedis } from "./config/redis.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

try {
  await sequelize.authenticate();
  await sequelize.sync();

  logger.info("Database connected successfully");

  try {
    await connectRedis();
  } catch (err) {
    logger.error("Redis connection failed", err);
  }

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  logger.error("Database connection failed", { error });
}
