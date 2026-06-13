import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError, sendSuccess } from "../utils/responseHandler.js";
import { getUserProfile, updateUserProfile } from "../services/userService.js";

function canAccessProfile(req, userId) {
  return req.user.role === "admin" || req.user._id.toString() === userId;
}

export async function getUser(req, res) {
  if (!canAccessProfile(req, req.params.id)) {
    throw new AppError("You can only access your own profile", 403, ERROR_CODES.FORBIDDEN);
  }
  const user = await getUserProfile(req.params.id);
  return sendSuccess(res, { message: "User profile retrieved", data: user });
}

export async function updateUser(req, res) {
  if (!canAccessProfile(req, req.params.id)) {
    throw new AppError("You can only update your own profile", 403, ERROR_CODES.FORBIDDEN);
  }
  const user = await updateUserProfile(req.params.id, req.body);
  return sendSuccess(res, { message: "User profile updated", data: user });
}
