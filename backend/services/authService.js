import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { normalizeEmail } from "../utils/helpers.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwtUtils.js";
import { AppError } from "../utils/responseHandler.js";

function buildAuthPayload(user, refreshToken) {
  return {
    user: user.toJSON(),
    accessToken: signAccessToken(user),
    refreshToken,
  };
}

export async function registerUser(payload) {
  const email = normalizeEmail(payload.email);
  const existing = await User.findOne({ email });

  if (existing) {
    throw new AppError("Email is already registered", 409, ERROR_CODES.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    email,
    password: hashedPassword,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role === "teacher" ? "teacher" : "student",
    batch: payload.batch || "",
    branch: payload.branch || "",
    skillAreas: payload.skillAreas || [],
  });

  const refreshToken = signRefreshToken(user);
  user.refreshTokens = [refreshToken];
  await user.save();

  return buildAuthPayload(user, refreshToken);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+password +refreshTokens");

  if (!user) {
    throw new AppError("Invalid email or password", 401, ERROR_CODES.AUTH_INVALID);
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw new AppError("Invalid email or password", 401, ERROR_CODES.AUTH_INVALID);
  }

  const refreshToken = signRefreshToken(user);
  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  await user.save();

  return buildAuthPayload(user, refreshToken);
}

export async function refreshAuthToken(refreshToken) {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.userId).select("+refreshTokens");

  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new AppError("Invalid refresh token", 401, ERROR_CODES.AUTH_INVALID);
  }

  const nextRefreshToken = signRefreshToken(user);
  user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
  user.refreshTokens.push(nextRefreshToken);
  await user.save();

  return buildAuthPayload(user, nextRefreshToken);
}

export async function logoutUser(userId, refreshToken) {
  if (!refreshToken) return;
  await User.findByIdAndUpdate(userId, { $pull: { refreshTokens: refreshToken } });
}
