import Assessment from "../models/Assessment.js";
import Submission from "../models/Submission.js";
import { creditCoins } from "./coinService.js";
import { updateProgressAfterSubmission } from "./adaptiveService.js";
import { updateLeaderboardForSubmission } from "./leaderboardService.js";
import { recordMetric } from "./analyticsService.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { buildPaginationMeta, parsePagination, scoreSubmission } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";

export async function listAssessments(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { isActive: true };
  if (query.topic) filter.topic = query.topic;
  if (query.difficulty) filter.difficulty = query.difficulty;

  const [items, total] = await Promise.all([
    Assessment.find(filter).select("-questions.correctAnswer").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Assessment.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function getAssessmentById(id, includeAnswers = false) {
  const query = Assessment.findById(id);
  if (includeAnswers) query.select("+questions.correctAnswer");
  const assessment = await query;
  if (!assessment) throw new AppError("Assessment not found", 404, ERROR_CODES.NOT_FOUND);
  return assessment;
}

export async function createAssessment(payload, userId) {
  return Assessment.create({
    ...payload,
    createdBy: userId,
    totalQuestions: payload.questions?.length || 0,
  });
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
