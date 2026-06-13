import { Router } from "express";
import {
  createAssessmentRecord,
  getAssessmentDetails,
  getAssessmentQuestions,
  getAssessments,
  submitAssessmentRecord,
} from "../controllers/assessmentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createAssessmentValidator, submitAssessmentValidator } from "../validators/assessmentValidator.js";
import { mongoIdParam, paginationValidator } from "../validators/commonValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", paginationValidator, validateRequest, asyncHandler(getAssessments));
router.post("/", authorizeRoles("teacher", "admin"), createAssessmentValidator, validateRequest, asyncHandler(createAssessmentRecord));
router.get("/:id", mongoIdParam("id"), validateRequest, asyncHandler(getAssessmentDetails));
router.get("/:id/questions", mongoIdParam("id"), validateRequest, asyncHandler(getAssessmentQuestions));
router.post("/:id/submit", mongoIdParam("id"), submitAssessmentValidator, validateRequest, asyncHandler(submitAssessmentRecord));

export default router;
