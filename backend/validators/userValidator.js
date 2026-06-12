import { body } from "express-validator";

export const updateUserValidator = [
  body("firstName").optional().trim().isLength({ min: 2 }).withMessage("firstName must be at least 2 characters"),
  body("lastName").optional().trim().isLength({ min: 2 }).withMessage("lastName must be at least 2 characters"),
  body("batch").optional().trim().isString(),
  body("branch").optional().trim().isString(),
  body("bio").optional().trim().isLength({ max: 500 }).withMessage("bio must be 500 characters or fewer"),
  body("profilePicture").optional().isURL().withMessage("profilePicture must be a URL"),
  body("skillAreas").optional().isArray().withMessage("skillAreas must be an array"),
];
