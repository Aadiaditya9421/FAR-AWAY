import { validationResult } from "express-validator";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";

export function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  next(new AppError("Request validation failed", 400, ERROR_CODES.VALIDATION_ERROR, result.array()));
}
