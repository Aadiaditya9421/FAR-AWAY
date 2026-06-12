import Assessment from "../models/Assessment.js";
import IntegrityEvent from "../models/IntegrityEvent.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";

export const EMPTY_INTEGRITY_SUMMARY = {
  totalEvents: 0,
  highSeverityEvents: 0,
  eventsByType: {},
  lastEventType: null,
  lastEventAt: null,
};

export async function recordIntegrityEvent({
  userId,
  assessmentId,
  attemptId = "",
  eventType,
  severity = "medium",
  metadata = {},
}) {
  const assessment = await Assessment.findById(assessmentId).select("_id");
  if (!assessment) throw new AppError("Assessment not found", 404, ERROR_CODES.NOT_FOUND);

  return IntegrityEvent.create({
    userId,
    assessmentId,
    attemptId,
    eventType,
    severity,
    metadata,
  });
}

function createEmptySummary() {
  return {
    ...EMPTY_INTEGRITY_SUMMARY,
    eventsByType: {},
  };
}

export async function summarizeIntegrityEventsForSubmissions(submissions = []) {
  const attemptIds = [
    ...new Set(
      submissions
        .map((submission) => submission.attemptId)
        .filter(Boolean),
    ),
  ];

  const summaries = new Map();
  attemptIds.forEach((attemptId) => summaries.set(attemptId, createEmptySummary()));

  if (!attemptIds.length) return summaries;

  const events = await IntegrityEvent.find({ attemptId: { $in: attemptIds } })
    .sort({ createdAt: 1 })
    .select("attemptId eventType severity createdAt");

  events.forEach((event) => {
    const summary = summaries.get(event.attemptId) || createEmptySummary();
    summary.totalEvents += 1;
    if (event.severity === "high") summary.highSeverityEvents += 1;
    summary.eventsByType[event.eventType] = (summary.eventsByType[event.eventType] || 0) + 1;
    summary.lastEventType = event.eventType;
    summary.lastEventAt = event.createdAt;
    summaries.set(event.attemptId, summary);
  });

  return summaries;
}
