import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import logger from "./config/logger.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import deviceRoutes from "./routes/device.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

app.use(morgan("combined", { stream }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/device", deviceRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack || err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;

try {
  throw new Error("Test error");
} catch (err: any) {
  logger.error(err.stack || err.message);
}
