import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";
import { isProduction } from "../config/env.js";

export function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, ERROR_CODES.NOT_FOUND));
}

export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let code = error.code || ERROR_CODES.INTERNAL_ERROR;
  let message = error.message || "Internal server error";
  let details = error.details || null;

  if (error.name === "ValidationError") {
    statusCode = 400;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = "Validation failed";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    statusCode = 401;
    code = ERROR_CODES.AUTH_INVALID;
    message = "Invalid or expired token";
    details = null;
  }

  if (error.code === 11000) {
    statusCode = 409;
    code = ERROR_CODES.CONFLICT;
    message = "Duplicate record";
    details = error.keyValue;
  }

  if (!isProduction) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
      stack: isProduction ? undefined : error.stack,
    },
  });
}
