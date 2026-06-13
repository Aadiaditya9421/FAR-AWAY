import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { normalizeEmail } from "../utils/helpers.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwtUtils.js";
import { AppError } from "../utils/responseHandler.js";
import { creditCoins } from "./coinService.js";
import { sendEmail } from "./emailService.js";

const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
const STARTING_COIN_BALANCE = 500;

let googleClient;

function buildAuthPayload(user, refreshToken) {
  const userData = user.toJSON();
  return {
    user: {
      ...userData,
      coinsBalance: userData.coinsBalance ?? 0,
      totalCoinsEarned: userData.totalCoinsEarned ?? 0,
      streak: userData.streak ?? 0,
    },
    accessToken: signAccessToken(user),
    refreshToken,
  };
}

function getGoogleClient() {
  if (!env.googleClientId) {
    throw new AppError("Google sign-in is not configured", 503, ERROR_CODES.BAD_REQUEST);
  }

  if (!googleClient) {
    googleClient = new OAuth2Client(env.googleClientId);
  }

  return googleClient;
}

async function verifyGoogleCredential(credential) {
  const client = getGoogleClient();
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
  } catch {
    throw new AppError("Invalid Google credential", 401, ERROR_CODES.AUTH_INVALID);
  }

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new AppError("Google account email must be verified", 401, ERROR_CODES.AUTH_INVALID);
  }

  return {
    googleId: payload.sub,
    email: normalizeEmail(payload.email),
    firstName: payload.given_name || "",
    lastName: payload.family_name || "",
    fullName: payload.name || "",
    picture: payload.picture || "",
  };
}

function splitGoogleName(profile) {
  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();
  if (firstName && lastName) return { firstName, lastName };

  const parts = profile.fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return {
      firstName: firstName || parts[0],
      lastName: lastName || parts.slice(1).join(" "),
    };
  }

  const fallback = profile.email.split("@")[0] || "Google";
  return {
    firstName: firstName || parts[0] || fallback,
    lastName: lastName || "User",
  };
}

function getUtcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isSameUtcDay(left, right) {
  if (!left || !right) return false;
  return getUtcDayStart(left).getTime() === getUtcDayStart(right).getTime();
}

function isPreviousUtcDay(left, right) {
  if (!left || !right) return false;
  const leftStart = getUtcDayStart(left).getTime();
  const rightStart = getUtcDayStart(right).getTime();
  return rightStart - leftStart === 24 * 60 * 60 * 1000;
}

async function addRefreshToken(user, refreshToken) {
  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        $each: [refreshToken],
        $slice: -5,
      },
    },
  });
}

async function recordDailyLogin(user) {
  const now = new Date();
  const lastLogin = user.lastStreakLoginAt;

  if (isSameUtcDay(lastLogin, now)) {
    return user;
  }

  const nextStreak = isPreviousUtcDay(lastLogin, now)
    ? (user.streak || 0) + 1
    : 1;

  const updated = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        streak: nextStreak,
        lastStreakLoginAt: now,
      },
    },
    { new: true },
  );

  return updated || user;
}

async function grantStartingCoins(user) {
  if (STARTING_COIN_BALANCE <= 0) return user;

  await creditCoins(
    user._id,
    STARTING_COIN_BALANCE,
    "Welcome bonus",
    "manual",
  );

  return User.findById(user._id);
}

function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildPasswordResetUrl(token) {
  const baseUrl = env.clientUrl.replace(/\/+$/, "");
  return `${baseUrl}/?resetToken=${encodeURIComponent(token)}`;
}

export async function registerUser(payload) {
  const email = normalizeEmail(payload.email);
  const existing = await User.findOne({ email });

  if (existing) {
    throw new AppError("Email is already registered", 409, ERROR_CODES.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  let user = await User.create({
    email,
    password: hashedPassword,
    authProvider: "local",
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role === "teacher" ? "teacher" : "student",
    batch: payload.batch || "",
    branch: payload.branch || "",
    skillAreas: payload.skillAreas || [],
    coinsBalance: 0,
    totalCoinsEarned: 0,
    streak: 0,
    lastStreakLoginAt: null,
    lastDailyBonusClaimedAt: null,
  });
  user = await recordDailyLogin(user);
  user = await grantStartingCoins(user);

  const refreshToken = signRefreshToken(user);
  await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: [refreshToken] } });

  return buildAuthPayload(user, refreshToken);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+password +refreshTokens");

  if (!user) {
    throw new AppError("Invalid email or password", 401, ERROR_CODES.AUTH_INVALID);
  }

  if (!user.password) {
    throw new AppError("Invalid email or password", 401, ERROR_CODES.AUTH_INVALID);
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw new AppError("Invalid email or password", 401, ERROR_CODES.AUTH_INVALID);
  }

  const activeUser = await recordDailyLogin(user);
  const refreshToken = signRefreshToken(user);
  await addRefreshToken(activeUser, refreshToken);

  return buildAuthPayload(activeUser, refreshToken);
}

export async function googleAuthUser({ credential, role = "student" }) {
  const profile = await verifyGoogleCredential(credential);
  let user = await User.findOne({ email: profile.email }).select("+password +refreshTokens");
  let isNewUser = false;

  if (user) {
    if (user.googleId && user.googleId !== profile.googleId) {
      throw new AppError("This email is linked to a different Google account", 409, ERROR_CODES.CONFLICT);
    }

    user.googleId = profile.googleId;
    user.emailVerified = true;
    user.isVerified = true;
    if (!user.password) user.authProvider = "google";
    if (!user.profilePicture && profile.picture) user.profilePicture = profile.picture;
    await user.save({ validateModifiedOnly: true });
  } else {
    const names = splitGoogleName(profile);
    user = await User.create({
      email: profile.email,
      firstName: names.firstName,
      lastName: names.lastName,
      role: role === "teacher" ? "teacher" : "student",
      authProvider: "google",
      googleId: profile.googleId,
      profilePicture: profile.picture,
      emailVerified: true,
      isVerified: true,
      coinsBalance: 0,
      totalCoinsEarned: 0,
      streak: 0,
      lastStreakLoginAt: null,
      lastDailyBonusClaimedAt: null,
    });
    isNewUser = true;
  }

  user = await recordDailyLogin(user);

  if (isNewUser) {
    user = await grantStartingCoins(user);
  }

  const refreshToken = signRefreshToken(user);
  await addRefreshToken(user, refreshToken);

  return buildAuthPayload(user, refreshToken);
}

export async function requestPasswordReset({ email }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select(
    "+passwordResetTokenHash +passwordResetExpiresAt"
  );

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const resetUrl = buildPasswordResetUrl(token);

    user.passwordResetTokenHash = hashPasswordResetToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await user.save({ validateModifiedOnly: true });

    await sendEmail({
      to: user.email,
      subject: "Reset your Far Away password",
      text: [
        "Use this link to reset your Far Away password:",
        resetUrl,
        "",
        "This link expires in 30 minutes. If you did not request it, you can ignore this email.",
      ].join("\n"),
      html: `
        <p>Use this link to reset your Far Away password:</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>
      `,
    });
  }

  return { resetQueued: true };
}

export async function resetPassword({ token, password }) {
  const tokenHash = hashPasswordResetToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+password +refreshTokens +passwordResetTokenHash +passwordResetExpiresAt");

  if (!user) {
    throw new AppError("Reset link is invalid or expired", 400, ERROR_CODES.BAD_REQUEST);
  }

  user.password = await bcrypt.hash(password, 12);
  user.authProvider = "local";
  user.passwordResetTokenHash = "";
  user.passwordResetExpiresAt = null;
  user.refreshTokens = [];
  await user.save();

  return { reset: true };
}

export async function refreshAuthToken(refreshToken) {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findOne({ _id: decoded.userId, refreshTokens: refreshToken }).select("+refreshTokens");

  if (!user) {
    throw new AppError("Invalid refresh token", 401, ERROR_CODES.AUTH_INVALID);
  }

  const nextRefreshToken = signRefreshToken(user);
  await User.findOneAndUpdate(
    { _id: user._id, refreshTokens: refreshToken },
    [
      {
        $set: {
          refreshTokens: {
            $slice: [
              {
                $concatArrays: [
                  {
                    $filter: {
                      input: "$refreshTokens",
                      as: "token",
                      cond: { $ne: ["$$token", refreshToken] },
                    },
                  },
                  [nextRefreshToken],
                ],
              },
              -5,
            ],
          },
        },
      },
    ],
  );

  return buildAuthPayload(user, nextRefreshToken);
}

export async function recordCurrentUserLogin(user) {
  return recordDailyLogin(user);
}

export async function logoutUser(userId, refreshToken) {
  if (!refreshToken) return;
  await User.findByIdAndUpdate(userId, { $pull: { refreshTokens: refreshToken } });
}
