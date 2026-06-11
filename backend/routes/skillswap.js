import { Router } from "express";
import { body } from "express-validator";
import { acceptRequest, declineRequest, getRequests, postRequest } from "../controllers/skillswapController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { mongoIdParam, paginationValidator } from "../validators/commonValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/requests", paginationValidator, validateRequest, asyncHandler(getRequests));
router.post(
  "/request",
  [
    body("teachSkill").trim().notEmpty().withMessage("teachSkill is required"),
    body("learnSkill").trim().notEmpty().withMessage("learnSkill is required"),
    body("receiverId").optional().isMongoId().withMessage("receiverId must be a valid MongoDB ObjectId"),
  ],
  validateRequest,
  asyncHandler(postRequest),
);
router.put("/accept/:id", mongoIdParam("id"), validateRequest, asyncHandler(acceptRequest));
router.put("/decline/:id", mongoIdParam("id"), validateRequest, asyncHandler(declineRequest));

export default router;
