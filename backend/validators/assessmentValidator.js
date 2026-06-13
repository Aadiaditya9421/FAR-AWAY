import { body } from "express-validator";

export const submitAssessmentValidator = [
  body("answers").isArray({ min: 1 }).withMessage("answers must be a non-empty array"),
  body("answers.*.questionId").notEmpty().withMessage("answers[].questionId is required"),
  body("answers.*.userAnswer").exists().withMessage("answers[].userAnswer is required"),
  body("timeTaken").isNumeric().withMessage("timeTaken must be a number"),
  body("attemptId").optional().isString().isLength({ max: 100 }).withMessage("attemptId must be at most 100 characters"),
];

export const createAssessmentValidator = [
  body("title").trim().isLength({ min: 3 }).withMessage("title is required"),
  body("topic").trim().notEmpty().withMessage("topic is required"),
  body("difficulty").isIn(["easy", "medium", "hard"]).withMessage("Invalid difficulty"),
  body("duration").isInt({ min: 1 }).withMessage("duration must be at least 1 minute"),
  body("questions").isArray({ min: 1 }).withMessage("questions are required"),
];

export const submissionFeedbackValidator = [
  body("feedback")
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage("feedback must be between 1 and 4000 characters"),
];

export const integrityEventValidator = [
  body("eventType")
    .isIn(["tab_hidden", "window_blur", "copy_attempt", "cut_attempt", "paste_attempt"])
    .withMessage("invalid eventType"),
  body("severity").optional().isIn(["low", "medium", "high"]).withMessage("invalid severity"),
  body("attemptId").optional().isString().isLength({ max: 100 }).withMessage("attemptId must be at most 100 characters"),
  body("metadata").optional().isObject().withMessage("metadata must be an object"),
];
