const DEFAULT_SEVERITY_BY_EVENT = {
  tab_hidden: "high",
  window_blur: "medium",
  copy_attempt: "medium",
  cut_attempt: "medium",
  paste_attempt: "high",
};

export function normalizeProctoringEvent(req, res, next) {
  const metadata = req.body.metadata && typeof req.body.metadata === "object"
    ? req.body.metadata
    : {};

  req.body.severity = req.body.severity || DEFAULT_SEVERITY_BY_EVENT[req.body.eventType] || "medium";
  req.body.metadata = {
    ...metadata,
    userAgent: req.get("user-agent") || "",
    ip: req.ip,
  };

  next();
}
