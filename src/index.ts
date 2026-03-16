import app from "./app.js";
import sequelize from "./db/connection.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

try {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log("Database connected successfully");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Database connection failed:", error);
};





