import { Router } from "express";
import {
  createAssessmentRecord,
  getAssessmentDetails,
  getAssessmentQuestions,
  getAssessments,
  getReviewSubmissions,
  recordIntegrityEventRecord,
  saveSubmissionFeedback,
  submitAssessmentRecord,
} from "../controllers/assessmentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { normalizeProctoringEvent } from "../middleware/proctoring.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createAssessmentValidator,
  integrityEventValidator,
  submissionFeedbackValidator,
  submitAssessmentValidator,
} from "../validators/assessmentValidator.js";
import { mongoIdParam, paginationValidator } from "../validators/commonValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", paginationValidator, validateRequest, asyncHandler(getAssessments));
router.post("/", authorizeRoles("teacher", "admin"), createAssessmentValidator, validateRequest, asyncHandler(createAssessmentRecord));
router.get("/submissions", authorizeRoles("teacher", "admin"), paginationValidator, validateRequest, asyncHandler(getReviewSubmissions));
router.put(
  "/submissions/:id/feedback",
  authorizeRoles("teacher", "admin"),
  mongoIdParam("id"),
  submissionFeedbackValidator,
  validateRequest,
  asyncHandler(saveSubmissionFeedback),
);
router.get("/:id", mongoIdParam("id"), validateRequest, asyncHandler(getAssessmentDetails));
router.get("/:id/questions", mongoIdParam("id"), validateRequest, asyncHandler(getAssessmentQuestions));
router.post(
  "/:id/integrity-events",
  mongoIdParam("id"),
  normalizeProctoringEvent,
  integrityEventValidator,
  validateRequest,
  asyncHandler(recordIntegrityEventRecord),
);
router.post("/:id/submit", mongoIdParam("id"), submitAssessmentValidator, validateRequest, asyncHandler(submitAssessmentRecord));

export default router;
