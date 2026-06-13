import { Router } from "express";
import { getBalance, getTransactions } from "../controllers/coinController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationValidator } from "../validators/commonValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/balance", asyncHandler(getBalance));
router.get("/transactions", paginationValidator, validateRequest, asyncHandler(getTransactions));

export default router;
