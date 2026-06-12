import Coin from "../models/Coin.js";
import User from "../models/User.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { parsePagination, buildPaginationMeta } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";

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
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);

  user.coinsBalance += amount;
  user.totalCoinsEarned += amount;
  await user.save();

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
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  if (user.coinsBalance < amount) {
    throw new AppError("Not enough coins", 400, ERROR_CODES.INSUFFICIENT_COINS);
  }

  user.coinsBalance -= amount;
  await user.save();

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
