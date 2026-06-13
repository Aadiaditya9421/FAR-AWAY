import { Router } from "express";
import { getProgress } from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/progress", asyncHandler(getProgress));

export default router;
