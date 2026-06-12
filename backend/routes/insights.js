import { Router } from "express";
import { explainQuestion, generateStudyNote, getInsights, getQuizHint } from "../controllers/insightsController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { explainQuestionValidator, quizHintValidator, studyNoteValidator } from "../validators/insightsValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/insights", asyncHandler(getInsights));
router.post("/explain", explainQuestionValidator, validateRequest, asyncHandler(explainQuestion));
router.post("/hint", quizHintValidator, validateRequest, asyncHandler(getQuizHint));
router.post(
  "/study-note",
  authorizeRoles("teacher", "admin"),
  studyNoteValidator,
  validateRequest,
  asyncHandler(generateStudyNote),
);

export default router;
