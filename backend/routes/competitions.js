import { Router } from "express";
import {
  createCompetitionRecord,
  getCompetitions,
  getStandings,
  joinCompetitionRecord,
} from "../controllers/competitionController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createCompetitionValidator, joinCompetitionValidator } from "../validators/competitionValidator.js";
import { mongoIdParam, paginationValidator } from "../validators/commonValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", paginationValidator, validateRequest, asyncHandler(getCompetitions));
router.post("/", authorizeRoles("admin"), createCompetitionValidator, validateRequest, asyncHandler(createCompetitionRecord));
router.post("/:id/join", mongoIdParam("id"), joinCompetitionValidator, validateRequest, asyncHandler(joinCompetitionRecord));
router.get("/:id/standings", mongoIdParam("id"), validateRequest, asyncHandler(getStandings));

export default router;
