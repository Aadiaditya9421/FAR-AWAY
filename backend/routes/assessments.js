import { Router } from "express";
import {
  createClassroomRecord,
  createAssessmentRecord,
  getAssignmentReport,
  getAssessmentDetails,
  getAssessmentQuestions,
  getAssessments,
  getClassrooms,
  getReviewSubmissions,
  recordIntegrityEventRecord,
  saveSubmissionFeedback,
  submitAssessmentRecord,
  updateClassroomRecord,
} from "../controllers/assessmentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { normalizeProctoringEvent } from "../middleware/proctoring.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createAssessmentValidator,
  classroomValidator,
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
router.get("/classrooms", authorizeRoles("teacher", "admin"), asyncHandler(getClassrooms));
router.post("/classrooms", authorizeRoles("teacher", "admin"), classroomValidator, validateRequest, asyncHandler(createClassroomRecord));
router.put("/classrooms/:id", authorizeRoles("teacher", "admin"), mongoIdParam("id"), classroomValidator, validateRequest, asyncHandler(updateClassroomRecord));
router.get("/submissions", authorizeRoles("teacher", "admin"), paginationValidator, validateRequest, asyncHandler(getReviewSubmissions));
router.put(
  "/submissions/:id/feedback",
  authorizeRoles("teacher", "admin"),
  mongoIdParam("id"),
  submissionFeedbackValidator,
  validateRequest,
  asyncHandler(saveSubmissionFeedback),
);
router.get(
  "/:id/assignment-report",
  authorizeRoles("teacher", "admin"),
  mongoIdParam("id"),
  validateRequest,
  asyncHandler(getAssignmentReport),
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
