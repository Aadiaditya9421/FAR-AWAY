import { body } from "express-validator";

export const submitAssessmentValidator = [
  body("answers").isArray({ min: 1 }).withMessage("answers must be a non-empty array"),
  body("answers.*.questionId").notEmpty().withMessage("answers[].questionId is required"),
  body("answers.*.userAnswer").exists().withMessage("answers[].userAnswer is required"),
  body("timeTaken").isNumeric().withMessage("timeTaken must be a number"),
];

export const createAssessmentValidator = [
  body("title").trim().isLength({ min: 3 }).withMessage("title is required"),
  body("topic").trim().notEmpty().withMessage("topic is required"),
  body("difficulty").isIn(["easy", "medium", "hard"]).withMessage("Invalid difficulty"),
  body("duration").isInt({ min: 1 }).withMessage("duration must be at least 1 minute"),
  body("questions").isArray({ min: 1 }).withMessage("questions are required"),
];
