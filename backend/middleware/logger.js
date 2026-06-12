export function requestLogger(req, res, next) {
  req.requestStartedAt = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - req.requestStartedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
}
