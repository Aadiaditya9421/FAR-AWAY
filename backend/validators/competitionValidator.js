import { body } from "express-validator";

export const createCompetitionValidator = [
  body("title").trim().isLength({ min: 3 }).withMessage("title is required"),
  body("type").isIn(["individual", "group"]).withMessage("Invalid competition type"),
  body("topic").trim().notEmpty().withMessage("topic is required"),
  body("startDate").isISO8601().withMessage("startDate must be a valid date"),
  body("endDate").isISO8601().withMessage("endDate must be a valid date"),
  body("entryFee").isInt({ min: 0 }).withMessage("entryFee must be zero or more"),
];

export const joinCompetitionValidator = [
  body("teamMembers").optional().isArray({ min: 1, max: 5 }).withMessage("teamMembers must contain 1 to 5 users"),
  body("teamName").optional().trim().isLength({ min: 2 }).withMessage("teamName must be at least 2 characters"),
];
