import {
  createAssessment,
  getAssessmentById,
  listSubmissionsForReview,
  listAssessments,
  submitAssessment,
  updateSubmissionFeedback,
} from "../services/assessmentService.js";
import { recordIntegrityEvent } from "../services/integrityService.js";
import { selectQuestionsForAttempt } from "../services/questionSelectionService.js";
import { sendCreated, sendSuccess } from "../utils/responseHandler.js";

export async function getAssessments(req, res) {
  const { items, meta } = await listAssessments(req.query);
  return sendSuccess(res, { message: "Assessments retrieved", data: items, meta });
}

export async function getAssessmentDetails(req, res) {
  const assessment = await getAssessmentById(req.params.id);
  return sendSuccess(res, { message: "Assessment retrieved", data: assessment });
}

export async function getAssessmentQuestions(req, res) {
  const assessment = await getAssessmentById(req.params.id);
  
  let questions = [];
  if (assessment.questionConfig?.isDynamic) {
    questions = await selectQuestionsForAttempt(req.user._id, assessment);
  } else {
    questions = assessment.questions;
  }

  return sendSuccess(res, {
    message: "Assessment questions retrieved",
    data: {
      assessmentId: assessment._id,
      title: assessment.title,
      duration: assessment.duration,
      questions: questions,
      isAdaptive: assessment.questionConfig?.isAdaptive || false,
    },
  });
}

export async function createAssessmentRecord(req, res) {
  const assessment = await createAssessment(req.body, req.user._id);
  return sendCreated(res, { message: "Assessment created", data: assessment });
}

export async function getReviewSubmissions(req, res) {
  const { items, meta } = await listSubmissionsForReview(req.query, req.user);
  return sendSuccess(res, { message: "Review submissions retrieved", data: items, meta });
}

export async function saveSubmissionFeedback(req, res) {
  const submission = await updateSubmissionFeedback({
    submissionId: req.params.id,
    reviewer: req.user,
    feedback: req.body.feedback,
  });
  return sendSuccess(res, { message: "Submission feedback saved", data: submission });
}

export async function recordIntegrityEventRecord(req, res) {
  const event = await recordIntegrityEvent({
    userId: req.user._id,
    assessmentId: req.params.id,
    attemptId: req.body.attemptId,
    eventType: req.body.eventType,
    severity: req.body.severity,
    metadata: req.body.metadata,
  });

  return sendCreated(res, { message: "Integrity event recorded", data: event });
}

export async function submitAssessmentRecord(req, res) {
  const submission = await submitAssessment({
    assessmentId: req.params.id,
    userId: req.user._id,
    answers: req.body.answers,
    timeTaken: req.body.timeTaken,
    attemptId: req.body.attemptId,
  });
  return sendCreated(res, { message: "Assessment submitted", data: submission });
}
