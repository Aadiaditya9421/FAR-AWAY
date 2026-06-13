import winston from "winston";
import { env } from "./env.js";

const isProduction = env.nodeEnv === "production";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Custom format for development logging (human-readable, colorized)
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}${info.requestId ? ` (reqId: ${info.requestId})` : ""}${info.stack ? `\nStack: ${info.stack}` : ""}`
  )
);

// Format for production logging (structured JSON)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger instance
export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  levels,
  format: isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console()
  ],
});
