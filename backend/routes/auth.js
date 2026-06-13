import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/responseHandler.js";
import {
  completePasswordReset,
  forgotPassword,
  googleAuth,
  login,
  logout,
  me,
  refreshToken,
  register,
} from "../controllers/authController.js";
import {
  forgotPasswordValidator,
  googleAuthValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
} from "../validators/authValidator.js";

const router = Router();

router.post("/register", authLimiter, registerValidator, validateRequest, asyncHandler(register));
router.post("/login", authLimiter, loginValidator, validateRequest, asyncHandler(login));
router.post("/google", authLimiter, googleAuthValidator, validateRequest, asyncHandler(googleAuth));
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validateRequest, asyncHandler(forgotPassword));
router.post("/reset-password", authLimiter, resetPasswordValidator, validateRequest, asyncHandler(completePasswordReset));
router.post("/refresh-token", refreshTokenValidator, validateRequest, asyncHandler(refreshToken));
router.post("/logout", authenticate, asyncHandler(logout));
router.get("/me", authenticate, asyncHandler(me));

export default router;
