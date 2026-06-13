import { logger } from "../config/logger.js";

export function requestLogger(req, res, next) {
  req.requestStartedAt = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - req.requestStartedAt;
    logger.info({
      message: `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      requestId: req.id,
      ip: req.ip,
    });
  });
  next();
}
