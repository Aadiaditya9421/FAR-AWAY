import { Router } from "express";
import { claimBonus, getBalance, getTransactions } from "../controllers/coinController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationValidator } from "../validators/commonValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/balance", asyncHandler(getBalance));
router.get("/transactions", paginationValidator, validateRequest, asyncHandler(getTransactions));
router.post("/daily-bonus", asyncHandler(claimBonus));

export default router;
