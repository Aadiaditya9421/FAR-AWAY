import { Router } from "express";
import { body } from "express-validator";
import {
  acceptRequest,
  cancelRequest,
  completeRequest,
  declineRequest,
  getRecommendedPeers,
  getRequests,
  postRequest,
  sendMessage,
  updateMeeting,
} from "../controllers/skillswapController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { mongoIdParam, paginationValidator } from "../validators/commonValidator.js";
import { asyncHandler } from "../utils/responseHandler.js";

const router = Router();
const allowedProofMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

router.use(authenticate);

router.get("/recommended", asyncHandler(getRecommendedPeers));
router.get("/requests", paginationValidator, validateRequest, asyncHandler(getRequests));
router.post(
  "/request",
  [
    body("teachSkill").trim().notEmpty().withMessage("teachSkill is required"),
    body("learnSkill").trim().notEmpty().withMessage("learnSkill is required"),
    body("message").optional().trim().isLength({ max: 500 }).withMessage("message must be at most 500 characters"),
    body("receiverId").optional().isMongoId().withMessage("receiverId must be a valid MongoDB ObjectId"),
    body("scheduledAt").optional().isISO8601().withMessage("scheduledAt must be a valid date"),
    body("verificationProof").isObject().withMessage("Skill verification proof is required"),
    body("verificationProof.proofType").isIn(["resume", "certificate"]).withMessage("proofType must be resume or certificate"),
    body("verificationProof.fileName").trim().isLength({ min: 1, max: 140 }).withMessage("proof fileName is required"),
    body("verificationProof.mimeType").isIn(allowedProofMimeTypes).withMessage("proof must be PDF or image"),
    body("verificationProof.fileSize").isInt({ min: 1, max: 1500000 }).withMessage("proof file must be 1.5MB or smaller"),
    body("verificationProof.dataUrl")
      .isString()
      .isLength({ min: 40, max: 2100000 })
      .withMessage("proof data is invalid")
      .custom((value, { req }) => {
        const mimeType = req.body?.verificationProof?.mimeType;
        return typeof value === "string" && value.startsWith(`data:${mimeType};base64,`);
      })
      .withMessage("proof data must match the uploaded file type"),
  ],
  validateRequest,
  asyncHandler(postRequest),
);
router.put("/accept/:id", mongoIdParam("id"), validateRequest, asyncHandler(acceptRequest));
router.put("/decline/:id", mongoIdParam("id"), validateRequest, asyncHandler(declineRequest));
router.put("/cancel/:id", mongoIdParam("id"), validateRequest, asyncHandler(cancelRequest));
router.put("/complete/:id", mongoIdParam("id"), validateRequest, asyncHandler(completeRequest));
router.post(
  "/message/:id",
  [
    mongoIdParam("id"),
    body("message").trim().isLength({ min: 1, max: 1000 }).withMessage("message must be 1-1000 characters"),
  ],
  validateRequest,
  asyncHandler(sendMessage),
);
router.put(
  "/meeting/:id",
  [
    mongoIdParam("id"),
    body("meetingUrl")
      .trim()
      .isURL({ protocols: ["https"], require_protocol: true })
      .withMessage("meetingUrl must be a valid HTTPS URL")
      .custom(value => {
        try {
          return new URL(value).hostname === "meet.google.com";
        } catch {
          return false;
        }
      })
      .withMessage("meetingUrl must be a Google Meet link"),
  ],
  validateRequest,
  asyncHandler(updateMeeting),
);

export default router;
