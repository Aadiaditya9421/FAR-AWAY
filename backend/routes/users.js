import { Router } from "express";
import { getUser, updateUser } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { mongoIdParam } from "../validators/commonValidator.js";
import { updateUserValidator } from "../validators/userValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();

router.use(authenticate);

router.get("/:id", mongoIdParam("id"), validateRequest, asyncHandler(getUser));
router.put("/:id", mongoIdParam("id"), updateUserValidator, validateRequest, asyncHandler(updateUser));

export default router;
