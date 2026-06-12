import { analyzeWeaknessesAndRecommend, explainMisconception } from "../services/learningInsightService.js";
import { generateQuizHint, generateStudyNoteForSubmission } from "../services/aiTutorService.js";
import { sendSuccess } from "../utils/responseHandler.js";

export async function getInsights(req, res) {
  const data = await analyzeWeaknessesAndRecommend(req.user._id);
  return sendSuccess(res, { message: "AI learning insights retrieved", data });
}

export async function explainQuestion(req, res) {
  const { submissionId, questionId } = req.body;
  const explanation = await explainMisconception(submissionId, questionId, req.user);
  return sendSuccess(res, { message: "AI misconception explanation retrieved", data: { explanation } });
}

export async function getQuizHint(req, res) {
  const data = await generateQuizHint({
    assessmentId: req.body.assessmentId,
    questionId: req.body.questionId,
    studentAnswer: req.body.studentAnswer,
    hintLevel: req.body.hintLevel,
  });

  return sendSuccess(res, { message: "AI quiz hint retrieved", data });
}

export async function generateStudyNote(req, res) {
  const data = await generateStudyNoteForSubmission({
    submissionId: req.body.submissionId,
    reviewer: req.user,
  });

  return sendSuccess(res, { message: "AI study note generated", data });
}
