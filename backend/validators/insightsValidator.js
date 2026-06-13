import { body } from "express-validator";

export const explainQuestionValidator = [
  body("submissionId").isMongoId().withMessage("submissionId must be a valid MongoDB ObjectId"),
  body("questionId").isMongoId().withMessage("questionId must be a valid MongoDB ObjectId"),
];

export const quizHintValidator = [
  body("assessmentId").isMongoId().withMessage("assessmentId must be a valid MongoDB ObjectId"),
  body("questionId").isMongoId().withMessage("questionId must be a valid MongoDB ObjectId"),
  body("studentAnswer").optional().isString().isLength({ max: 5000 }).withMessage("studentAnswer is too long"),
  body("hintLevel").optional().isInt({ min: 1, max: 3 }).withMessage("hintLevel must be between 1 and 3").toInt(),
];

export const studyNoteValidator = [
  body("submissionId").isMongoId().withMessage("submissionId must be a valid MongoDB ObjectId"),
];
