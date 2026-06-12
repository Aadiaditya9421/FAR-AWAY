import { Router } from "express";
import {
  createProblemRecord,
  getProblemDetails,
  getProblems,
  reviewProblemCode,
  runProblem,
  submitProblem,
} from "../controllers/problemController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { mongoIdParam } from "../validators/commonValidator.js";
import { codeExecutionValidator, createProblemValidator } from "../validators/problemValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getProblems));
router.post("/", authorizeRoles("teacher", "admin"), createProblemValidator, validateRequest, asyncHandler(createProblemRecord));
router.get("/:id", mongoIdParam("id"), validateRequest, asyncHandler(getProblemDetails));
router.post("/:id/run", mongoIdParam("id"), codeExecutionValidator, validateRequest, asyncHandler(runProblem));
router.post("/:id/submit", mongoIdParam("id"), codeExecutionValidator, validateRequest, asyncHandler(submitProblem));
router.post("/:id/review", mongoIdParam("id"), codeExecutionValidator, validateRequest, asyncHandler(reviewProblemCode));

export default router;
