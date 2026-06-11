import User from "../models/User.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { pick } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";

const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "batch",
  "branch",
  "profilePicture",
  "bio",
  "skillAreas",
];

export async function getUserProfile(userId) {
  const user = await User.findById(userId).select("-refreshTokens -password");
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return user;
}

export async function updateUserProfile(userId, payload) {
  const updates = pick(payload, PROFILE_FIELDS);
  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return user;
}
