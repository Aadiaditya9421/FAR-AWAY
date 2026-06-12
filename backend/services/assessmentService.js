import Assessment from "../models/Assessment.js";
import Submission from "../models/Submission.js";
import QuestionBank from "../models/QuestionBank.js";
import { creditCoins } from "./coinService.js";
import { updateProgressAfterSubmission } from "./adaptiveService.js";
import { updateLeaderboardForSubmission } from "./leaderboardService.js";
import { recordMetric } from "./analyticsService.js";
import { EMPTY_INTEGRITY_SUMMARY, summarizeIntegrityEventsForSubmissions } from "./integrityService.js";
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

function canReviewSubmission(submission, reviewer) {
  if (reviewer.role === "admin") return true;
  const createdBy = submission.assessmentId?.createdBy;
  return Boolean(createdBy && createdBy.toString() === reviewer._id.toString());
}

function decorateSubmissionForReview(submission, questionTextById = new Map(), integritySummaryByAttempt = new Map()) {
  const raw = submission.toObject();
  const assessmentQuestions = raw.assessmentId?.questions || [];
  const assessmentQuestionTextById = new Map(
    assessmentQuestions
      .filter((question) => question._id)
      .map((question) => [question._id.toString(), question.title]),
  );

  return {
    ...raw,
    integritySummary: integritySummaryByAttempt.get(raw.attemptId) || EMPTY_INTEGRITY_SUMMARY,
    reviewQuestions: raw.answers.map((answer, index) => {
      const questionId = answer.questionId?.toString();
      return {
        ...answer,
        text:
          assessmentQuestionTextById.get(questionId)
          || questionTextById.get(questionId)
          || `Question ${index + 1}`,
      };
    }),
  };
}

export async function listSubmissionsForReview(query, reviewer) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (reviewer.role === "teacher") {
    const assessmentIds = await Assessment.find({ createdBy: reviewer._id }).distinct("_id");
    filter.assessmentId = { $in: assessmentIds };
  }

  const [items, total] = await Promise.all([
    Submission.find(filter)
      .populate("userId", "firstName lastName email")
      .populate("assessmentId", "title topic difficulty createdBy questions.title")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Submission.countDocuments(filter),
  ]);

  const questionIds = [
    ...new Set(items.flatMap((item) => item.answers.map((answer) => answer.questionId?.toString()).filter(Boolean))),
  ];
  const questionBankItems = questionIds.length
    ? await QuestionBank.find({ _id: { $in: questionIds } }).select("title")
    : [];
  const questionTextById = new Map(questionBankItems.map((question) => [question._id.toString(), question.title]));
  const integritySummaryByAttempt = await summarizeIntegrityEventsForSubmissions(items);

  return {
    items: items.map((item) => decorateSubmissionForReview(item, questionTextById, integritySummaryByAttempt)),
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function updateSubmissionFeedback({ submissionId, reviewer, feedback }) {
  const submission = await Submission.findById(submissionId)
    .populate("assessmentId", "title topic difficulty createdBy questions.title")
    .populate("userId", "firstName lastName email");

  if (!submission) throw new AppError("Submission not found", 404, ERROR_CODES.NOT_FOUND);
  if (!canReviewSubmission(submission, reviewer)) {
    throw new AppError("You do not have permission to review this submission", 403, ERROR_CODES.FORBIDDEN);
  }

  submission.feedback = feedback;
  submission.reviewedBy = reviewer._id;
  submission.reviewedAt = new Date();
  await submission.save();

  await submission.populate("reviewedBy", "firstName lastName email");

  const questionIds = submission.answers.map((answer) => answer.questionId?.toString()).filter(Boolean);
  const questionBankItems = questionIds.length
    ? await QuestionBank.find({ _id: { $in: questionIds } }).select("title")
    : [];
  const questionTextById = new Map(questionBankItems.map((question) => [question._id.toString(), question.title]));
  const integritySummaryByAttempt = await summarizeIntegrityEventsForSubmissions([submission]);

  return decorateSubmissionForReview(submission, questionTextById, integritySummaryByAttempt);
}

export async function submitAssessment({ assessmentId, userId, answers, timeTaken, attemptId = "" }) {
  const assessment = await getAssessmentById(assessmentId, true);
  
  let gradingQuestions = [];
  if (assessment.questionConfig?.isDynamic) {
    const questionIds = answers.map((a) => a.questionId);
    gradingQuestions = await QuestionBank.find({ _id: { $in: questionIds } }).select("+correctAnswer");
  } else {
    gradingQuestions = assessment.questions;
  }

  const { score, correctCount, incorrectCount, checkedAnswers } = scoreSubmission(gradingQuestions, answers);
  const coinsEarned = score >= 80
    ? assessment.coinsReward
    : Math.round(assessment.coinsReward / 2);

  const submission = await Submission.create({
    userId,
    assessmentId,
    attemptId,
    answers: checkedAnswers,
    score,
    correctCount,
    incorrectCount,
    timeTaken,
    coinsEarned,
    questionsShown: gradingQuestions.map((q) => q._id),
  });

  await Promise.all([
    creditCoins(userId, coinsEarned, `Completed assessment: ${assessment.title}`, "assessment", assessment._id),
    updateProgressAfterSubmission({
      userId,
      topic: assessment.topic,
      score,
      correctCount,
      incorrectCount,
      answers: checkedAnswers,
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
