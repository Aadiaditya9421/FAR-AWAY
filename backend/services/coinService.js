import Coin from "../models/Coin.js";
import User from "../models/User.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { parsePagination, buildPaginationMeta } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";

const DAILY_BONUS_AMOUNT = 10;

function assertCoinAmount(amount) {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new AppError("Coin amount must be zero or more", 400, ERROR_CODES.BAD_REQUEST);
  }
}

function getUtcDayWindow(date = new Date()) {
  const start = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ));
  const next = new Date(start);
  next.setUTCDate(next.getUTCDate() + 1);
  return { start, next };
}

export async function getCoinBalance(userId) {
  const user = await User.findById(userId).select("coinsBalance totalCoinsEarned");
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return {
    coinsBalance: user.coinsBalance,
    totalCoinsEarned: user.totalCoinsEarned,
  };
}

export async function listCoinTransactions(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { userId };
  const [items, total] = await Promise.all([
    Coin.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Coin.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function creditCoins(userId, amount, reason, referenceType = "manual", referenceId = null) {
  assertCoinAmount(amount);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        coinsBalance: amount,
        totalCoinsEarned: amount,
      },
    },
    { new: true },
  ).select("coinsBalance totalCoinsEarned");

  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);

  return Coin.create({
    userId,
    type: "credit",
    amount,
    balanceAfter: user.coinsBalance,
    reason,
    referenceType,
    referenceId,
  });
}

export async function debitCoins(userId, amount, reason, referenceType = "manual", referenceId = null) {
  assertCoinAmount(amount);

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      coinsBalance: { $gte: amount },
    },
    {
      $inc: {
        coinsBalance: -amount,
      },
    },
    { new: true },
  ).select("coinsBalance totalCoinsEarned");

  if (!user) {
    const exists = await User.exists({ _id: userId });
    if (!exists) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
    throw new AppError("Not enough coins", 400, ERROR_CODES.INSUFFICIENT_COINS);
  }

  return Coin.create({
    userId,
    type: "debit",
    amount,
    balanceAfter: user.coinsBalance,
    reason,
    referenceType,
    referenceId,
  });
}

export async function claimDailyBonus(userId) {
  const now = new Date();
  const { start, next } = getUtcDayWindow(now);

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { lastDailyBonusClaimedAt: null },
        { lastDailyBonusClaimedAt: { $exists: false } },
        { lastDailyBonusClaimedAt: { $lt: start } },
      ],
    },
    {
      $inc: {
        coinsBalance: DAILY_BONUS_AMOUNT,
        totalCoinsEarned: DAILY_BONUS_AMOUNT,
      },
      $set: {
        lastDailyBonusClaimedAt: now,
      },
    },
    {
      new: true,
    },
  ).select("coinsBalance totalCoinsEarned lastDailyBonusClaimedAt");

  if (!user) {
    throw new AppError(
      "Daily bonus already claimed. Come back tomorrow.",
      409,
      ERROR_CODES.CONFLICT,
      { nextClaimAt: next.toISOString() },
    );
  }

  await Coin.create({
    userId,
    type: "credit",
    amount: DAILY_BONUS_AMOUNT,
    balanceAfter: user.coinsBalance,
    reason: "Daily login bonus",
    referenceType: "daily_bonus",
  });

  return {
    amount: DAILY_BONUS_AMOUNT,
    coinsBalance: user.coinsBalance,
    totalCoinsEarned: user.totalCoinsEarned,
    claimedAt: user.lastDailyBonusClaimedAt,
    nextClaimAt: next,
  };
}
