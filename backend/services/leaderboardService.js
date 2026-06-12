import LeaderBoard from "../models/LeaderBoard.js";
import User from "../models/User.js";
import { buildPaginationMeta, parsePagination } from "../utils/helpers.js";
import { buildKey, cacheDeleteByPrefix, withCache, CACHE_TTL } from "../utils/cache.js";

function badgeFromScore(score) {
  if (score >= 90) return "Expert";
  if (score >= 60) return "Intermediate";
  return "Beginner";
}

export async function recalculateTopicRanks(topic) {
  const entries = await LeaderBoard.find({ topic }).sort({ score: -1, xp: -1, updatedAt: 1 });
  await Promise.all(entries.map((entry, index) => {
    entry.rank = index + 1;
    return entry.save();
  }));
}

export async function updateLeaderboardForSubmission({ userId, topic, score, coinsEarned }) {
  const xpEarned = score * 5;
  const current = await LeaderBoard.findOne({ userId, topic });
  const bestScore = Math.max(current?.score || 0, score);
  const xp = (current?.xp || 0) + xpEarned;
  const coins = (current?.coins || 0) + coinsEarned;

  const entry = await LeaderBoard.findOneAndUpdate(
    { userId, topic },
    {
      userId,
      topic,
      score: bestScore,
      xp,
      coins,
      badge: badgeFromScore(bestScore),
    },
    { upsert: true, new: true },
  );

  await recalculateTopicRanks(topic);
  // Ranks for the whole topic (and any user's rankings) may have shifted.
  await cacheDeleteByPrefix("leaderboard:");
  return entry;
}

export async function getTopicLeaderboard(topic, query) {
  const { page, limit, skip } = parsePagination(query);
  const cacheKey = buildKey(`leaderboard:topic:${topic}`, { page, limit });

  return withCache(cacheKey, CACHE_TTL.leaderboard, async () => {
    const filter = { topic };
    const [items, total] = await Promise.all([
      LeaderBoard.find(filter)
        .populate("userId", "firstName lastName email profilePicture")
        .sort({ rank: 1, score: -1 })
        .skip(skip)
        .limit(limit),
      LeaderBoard.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  });
}

export async function getUserRankings(userId) {
  return withCache(`leaderboard:user:${userId}`, CACHE_TTL.leaderboard, async () => {
    const [user, rankings] = await Promise.all([
      User.findById(userId).select("firstName lastName email coinsBalance totalCoinsEarned"),
      LeaderBoard.find({ userId }).sort({ topic: 1 }),
    ]);

    return { user, rankings };
  });
}
