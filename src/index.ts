import app from "./app.js";
import sequelize from "./db/connection.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import logger from "./config/logger.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

try {
  await sequelize.authenticate();
  await sequelize.sync();

  logger.info("Database connected successfully");

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });

} catch (error) {
  logger.error("Database connection failed", { error });
}




