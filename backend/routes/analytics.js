import { Router } from "express";
import { getPracticeSet, getProgress } from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/progress", asyncHandler(getProgress));
router.get("/practice-set", asyncHandler(getPracticeSet));

export default router;
