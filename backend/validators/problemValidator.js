import { body } from "express-validator";

export const codeExecutionValidator = [
  body("language")
    .trim()
    .isIn(["javascript", "python", "cpp", "java"])
    .withMessage("language must be one of javascript, python, cpp, java"),
  body("sourceCode")
    .isString()
    .isLength({ min: 1, max: 20000 })
    .withMessage("sourceCode must be between 1 and 20000 characters"),
];

export const createProblemValidator = [
  body("title").trim().isLength({ min: 3 }).withMessage("title is required"),
  body("slug").trim().isLength({ min: 3 }).withMessage("slug is required"),
  body("statement").trim().isLength({ min: 10 }).withMessage("statement is required"),
  body("difficulty").isIn(["easy", "medium", "hard"]).withMessage("Invalid difficulty"),
  body("testCases").isArray({ min: 1 }).withMessage("testCases are required"),
  body("testCases.*.expectedOutput").isString().notEmpty().withMessage("expectedOutput is required"),
  body("supportedLanguages").optional().isArray({ min: 1 }).withMessage("supportedLanguages must be an array"),
];
