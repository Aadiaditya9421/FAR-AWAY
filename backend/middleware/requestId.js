import crypto from "crypto";

/**
 * Middleware that assigns a unique UUID to each request.
 * Useful for correlating logs and tracing issues back to specific requests.
 */
export function requestIdMiddleware(req, res, next) {
  // Check if request already has a request ID header (e.g., from a proxy / load balancer)
  const requestId = req.header("X-Request-ID") || crypto.randomUUID();

  // Attach to request object so it can be read by logger / route handlers
  req.id = requestId;

  // Set response header so clients/browsers can report it in case of errors
  res.setHeader("X-Request-ID", requestId);

  next();
}
