import {
  assertAssessmentCanStart,
  createAssessment,
  getAssessmentAssignmentReport,
  getAssessmentById,
  listAssignedStudentsForAssessment,
  listClassrooms,
  listSubmissionsForReview,
  listAssessments,
  submitAssessment,
  updateSubmissionFeedback,
} from "../services/assessmentService.js";
import { recordIntegrityEvent } from "../services/integrityService.js";
import { selectQuestionsForAttempt } from "../services/questionSelectionService.js";
import { emitAppDataChanged, emitUserDataChanged, emitUsersDataChanged } from "../sockets/notificationSocket.js";
import { sendCreated, sendSuccess } from "../utils/responseHandler.js";

export async function getAssessments(req, res) {
  const { items, meta } = await listAssessments(req.query, req.user);
  return sendSuccess(res, { message: "Assessments retrieved", data: items, meta });
}

export async function getAssessmentDetails(req, res) {
  const assessment = await getAssessmentById(req.params.id, false, req.user);
  return sendSuccess(res, { message: "Assessment retrieved", data: assessment });
}

export async function getAssessmentQuestions(req, res) {
  const assessment = await getAssessmentById(req.params.id, false, req.user);
  assertAssessmentCanStart(assessment, req.user);
  
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
  const assessment = await createAssessment(req.body, req.user);
  const assignedStudents = await listAssignedStudentsForAssessment(assessment._id);
  emitUsersDataChanged(assignedStudents.map((student) => student._id), {
    scope: "assessments",
    source: "assessment:assigned",
    entityId: assessment._id,
  });
  emitAppDataChanged({
    scope: "assessments",
    source: "assessment:created",
    entityId: assessment._id,
  });
  return sendCreated(res, { message: "Assessment created", data: assessment });
}

export async function getClassrooms(req, res) {
  const classrooms = await listClassrooms();
  return sendSuccess(res, { message: "Classrooms retrieved", data: classrooms });
}

export async function getAssignmentReport(req, res) {
  const report = await getAssessmentAssignmentReport(req.params.id, req.user);
  return sendSuccess(res, { message: "Assignment report retrieved", data: report });
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
  emitUserDataChanged(submission.userId?._id || submission.userId, {
    scope: "assessments",
    source: "assessment:feedback",
    entityId: submission._id,
  });
  emitAppDataChanged({
    scope: "submissions",
    source: "assessment:feedback",
    entityId: submission._id,
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
  emitUserDataChanged(req.user._id, {
    scope: "analytics",
    source: "assessment:submitted",
    entityId: submission._id,
  });
  emitAppDataChanged({
    scope: "submissions",
    source: "assessment:submitted",
    entityId: submission._id,
  });
  return sendCreated(res, { message: "Assessment submitted", data: submission });
}
