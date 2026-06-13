import {
  createAssessment,
  getAssessmentById,
  listAssessments,
  submitAssessment,
} from "../services/assessmentService.js";
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
  return sendSuccess(res, {
    message: "Assessment questions retrieved",
    data: {
      assessmentId: assessment._id,
      title: assessment.title,
      duration: assessment.duration,
      questions: assessment.questions,
    },
  });
}

export async function createAssessmentRecord(req, res) {
  const assessment = await createAssessment(req.body, req.user._id);
  return sendCreated(res, { message: "Assessment created", data: assessment });
}

export async function submitAssessmentRecord(req, res) {
  const submission = await submitAssessment({
    assessmentId: req.params.id,
    userId: req.user._id,
    answers: req.body.answers,
    timeTaken: req.body.timeTaken,
  });
  return sendCreated(res, { message: "Assessment submitted", data: submission });
}
