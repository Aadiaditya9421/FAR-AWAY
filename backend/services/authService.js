import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { normalizeEmail } from "../utils/helpers.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwtUtils.js";
import { AppError } from "../utils/responseHandler.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "./emailService.js";

// Password reset tokens are short-lived; matches the wording in the email template.
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

// We store only a SHA-256 hash of the reset token, never the raw token.
function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

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

  // Fire-and-forget: a failed welcome email must never block registration.
  sendWelcomeEmail(user).catch((error) =>
    console.error(`[email] Welcome email failed: ${error.message}`)
  );

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

/**
 * Begin a password reset. Generates a single-use token, stores its hash with an
 * expiry, and emails the raw token link. Returns nothing and never reveals
 * whether the email exists (prevents account enumeration).
 */
export async function requestPasswordReset(email) {
  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashResetToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  // Fire-and-forget so a mail failure doesn't leak timing/existence info.
  sendPasswordResetEmail(user, rawToken).catch((error) =>
    console.error(`[email] Password reset email failed: ${error.message}`)
  );
}

/**
 * Complete a password reset using a valid, unexpired token. Sets the new
 * password and invalidates all existing sessions for safety.
 */
export async function resetPassword({ token, password }) {
  const hashedToken = hashResetToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires +refreshTokens");

  if (!user) {
    throw new AppError(
      "Password reset token is invalid or has expired",
      400,
      ERROR_CODES.BAD_REQUEST,
    );
  }

  user.password = await bcrypt.hash(password, 12);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  // Force re-login everywhere after a reset.
  user.refreshTokens = [];
  await user.save();
}
