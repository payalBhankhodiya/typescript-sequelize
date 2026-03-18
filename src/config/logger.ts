import { createLogger, format, transports, Logger } from "winston";

const { combine, timestamp, errors, json, printf } = format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: combine(
    format.colorize(),
    format.simple(),
    timestamp(),
    errors({ stack: true }),
    process.env.NODE_ENV === "production" ? json() : devFormat,
  ),

  defaultMeta: { service: "my-app" },

  transports: [
    new transports.Console(),

    new transports.File({
      filename: "../logs/error.log",
      level: "error",
    }),

    new transports.File({
      filename: "../logs/combined.log",
    }),
  ],

  exceptionHandlers: [
    new transports.File({ filename: "../logs/exceptions.log" }),
  ],

  rejectionHandlers: [
    new transports.File({ filename: "../logs/rejections.log" }),
  ],
});

export default logger;
