import { body } from "express-validator";

export const registerValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must include one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must include one number"),
  body("firstName").trim().isLength({ min: 2 }).withMessage("firstName must be at least 2 characters"),
  body("lastName").trim().isLength({ min: 2 }).withMessage("lastName must be at least 2 characters"),
  body("role").optional().isIn(["student", "teacher"]).withMessage("role must be student or teacher"),
  body("batch").optional().trim().isString(),
  body("branch").optional().trim().isString(),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const refreshTokenValidator = [
  body("refreshToken").notEmpty().withMessage("refreshToken is required"),
];
