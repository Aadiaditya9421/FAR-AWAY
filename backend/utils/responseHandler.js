import { ERROR_CODES } from "./errorCodes.js";

export class AppError extends Error {
  constructor(message, statusCode = 500, code = ERROR_CODES.INTERNAL_ERROR, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export function sendSuccess(res, { statusCode = 200, message = "Success", data = null, meta = null } = {}) {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

export function sendCreated(res, { message = "Created", data = null } = {}) {
  return sendSuccess(res, { statusCode: 201, message, data });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
