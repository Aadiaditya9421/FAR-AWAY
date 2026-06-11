import { Router } from "express";
import { getLeaderboardByTopic, getUserLeaderboardRankings } from "../controllers/leaderboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { mongoIdParam, paginationValidator } from "../validators/commonValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/user/:userId", mongoIdParam("userId"), validateRequest, asyncHandler(getUserLeaderboardRankings));
router.get("/:topic", paginationValidator, validateRequest, asyncHandler(getLeaderboardByTopic));

export default router;
