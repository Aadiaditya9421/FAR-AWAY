import Assessment from "../models/Assessment.js";
import Submission from "../models/Submission.js";
import { creditCoins } from "./coinService.js";
import { updateProgressAfterSubmission } from "./adaptiveService.js";
import { updateLeaderboardForSubmission } from "./leaderboardService.js";
import { recordMetric } from "./analyticsService.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { buildPaginationMeta, parsePagination, scoreSubmission } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";
import { buildKey, cacheDeleteByPrefix, withCache, CACHE_TTL } from "../utils/cache.js";

export async function listAssessments(query) {
  const { page, limit, skip } = parsePagination(query);
  const cacheKey = buildKey("assessments:list", {
    page,
    limit,
    topic: query.topic,
    difficulty: query.difficulty,
  });

  return withCache(cacheKey, CACHE_TTL.assessmentList, async () => {
    const filter = { isActive: true };
    if (query.topic) filter.topic = query.topic;
    if (query.difficulty) filter.difficulty = query.difficulty;

    const [items, total] = await Promise.all([
      Assessment.find(filter).select("-questions.correctAnswer").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Assessment.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  });
}

export async function getAssessmentById(id, includeAnswers = false) {
  // Never cache the answer-bearing variant: it is used for scoring and must
  // always reflect the authoritative document (and must not leak answers).
  if (includeAnswers) {
    const assessment = await Assessment.findById(id).select("+questions.correctAnswer");
    if (!assessment) throw new AppError("Assessment not found", 404, ERROR_CODES.NOT_FOUND);
    return assessment;
  }

  return withCache(`assessment:${id}`, CACHE_TTL.assessment, async () => {
    const assessment = await Assessment.findById(id);
    if (!assessment) throw new AppError("Assessment not found", 404, ERROR_CODES.NOT_FOUND);
    return assessment;
  });
}

export async function createAssessment(payload, userId) {
  const assessment = await Assessment.create({
    ...payload,
    createdBy: userId,
    totalQuestions: payload.questions?.length || 0,
  });
  // A new assessment can appear in any listing; drop cached list pages.
  await cacheDeleteByPrefix("assessments:list");
  return assessment;
}

export async function submitAssessment({ assessmentId, userId, answers, timeTaken }) {
  const assessment = await getAssessmentById(assessmentId, true);
  const { score, correctCount, incorrectCount, checkedAnswers } = scoreSubmission(assessment.questions, answers);
  const coinsEarned = score >= 80
    ? assessment.coinsReward
    : Math.round(assessment.coinsReward / 2);

  const submission = await Submission.create({
    userId,
    assessmentId,
    answers: checkedAnswers,
    score,
    correctCount,
    incorrectCount,
    timeTaken,
    coinsEarned,
  });

  await Promise.all([
    creditCoins(userId, coinsEarned, `Completed assessment: ${assessment.title}`, "assessment", assessment._id),
    updateProgressAfterSubmission({
      userId,
      topic: assessment.topic,
      score,
      correctCount,
      incorrectCount,
    }),
    updateLeaderboardForSubmission({
      userId,
      topic: assessment.topic,
      score,
      coinsEarned,
    }),
    recordMetric({
      userId,
      topic: assessment.topic,
      metric: "assessment_score",
      value: score,
      metadata: { assessmentId: assessment._id, submissionId: submission._id },
    }),
  ]);

  return submission;
}
