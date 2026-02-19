import express from "express";
import sequelize from "./config/database.js";

import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());



// Register routes
app.use("/api/users", userRoutes);

try {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log("Database connected successfully");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Database connection failed:", error);
}
