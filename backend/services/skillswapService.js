import SkillSwap from "../models/SkillSwap.js";
import UserProgress from "../models/UserProgress.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { buildPaginationMeta, parsePagination } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";

const SKILL_ALIASES = {
  javascript: ["javascript", "js", "react", "frontend", "webdev", "node"],
  react: ["react", "javascript", "frontend", "webdev"],
  dsa: ["dsa", "data structures", "algorithms", "c++", "cpp", "python", "java"],
  oops: ["oops", "oop", "object oriented", "java", "c++", "cpp"],
  webdev: ["webdev", "web development", "frontend", "html", "css", "javascript", "react"],
  backend: ["backend", "node", "express", "api", "database", "databases"],
  python: ["python", "machine learning", "ml", "data science"],
};

function normalizeSkill(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9+# ]/g, " ").replace(/\s+/g, " ").trim();
}

function skillTerms(value = "") {
  const normalized = normalizeSkill(value);
  return new Set([normalized, ...(SKILL_ALIASES[normalized] || [])].filter(Boolean));
}

function skillMatchScore(teachSkill, targetTopic, peerSkillAreas = []) {
  const teach = normalizeSkill(teachSkill);
  const target = normalizeSkill(targetTopic);
  const teachTerms = skillTerms(teach);
  const targetTerms = skillTerms(target);
  const peerTerms = peerSkillAreas.flatMap(area => [...skillTerms(area)]);

  if (!teach || !target) return 0;
  if (teach === target) return 1;
  if (teach.includes(target) || target.includes(teach)) return 0.9;
  if ([...teachTerms].some(term => targetTerms.has(term))) return 0.78;
  if (peerTerms.some(term => targetTerms.has(term))) return 0.62;
  return 0.15;
}

function getDisplayName(user) {
  if (!user || typeof user === "string") return "Peer";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "Peer";
}

function recommendationReason({ request, targetTopic, skillFit, peerMastery, availabilityScore }) {
  const reasons = [];
  if (skillFit >= 0.9) {
    reasons.push(`Can directly teach ${targetTopic}`);
  } else if (skillFit >= 0.6) {
    reasons.push(`Has adjacent skills for ${targetTopic}`);
  } else {
    reasons.push("Nearest available peer while stronger matches are scarce");
  }

  if (skillFit >= 0.6 && peerMastery >= 0.75) {
    reasons.push(`Shows strong ${targetTopic} mastery`);
  } else if (skillFit >= 0.6 && peerMastery >= 0.5) {
    reasons.push(`Has workable ${targetTopic} background`);
  }

  if (availabilityScore >= 1) {
    reasons.push("Has a future session window");
  } else if (!request.scheduledAt) {
    reasons.push("Open to scheduling");
  }

  return reasons;
}

export async function listSkillSwapRequests(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {
    $or: [{ requester: userId }, { receiver: userId }, { status: "open" }],
  };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    SkillSwap.find(filter)
      .populate("requester", "firstName lastName email skillAreas")
      .populate("receiver", "firstName lastName email skillAreas")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SkillSwap.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function recommendSkillSwapPeers(userId, query = {}) {
  const limit = Math.max(1, Math.min(10, Number(query.limit) || 5));

  const progress = await UserProgress.find({ userId }).sort({ mastery: 1, updatedAt: -1 });
  const activeProgress = progress.filter(item => item.attemptCount > 0);
  const weakProgress = activeProgress.filter(item => (item.mastery ?? 0.25) < 0.65);
  const focusProgress = weakProgress.length ? weakProgress : activeProgress;
  const weakTopics = (focusProgress.length ? focusProgress : [
    { topic: "DSA", mastery: 0.25 },
    { topic: "JavaScript", mastery: 0.25 },
  ])
    .slice(0, 3)
    .map(item => ({
      topic: item.topic,
      mastery: item.mastery ?? 0.25,
    }));

  const requests = await SkillSwap.find({
    status: "open",
    requester: { $ne: userId },
  })
    .populate("requester", "firstName lastName email skillAreas")
    .sort({ createdAt: -1 })
    .limit(50);

  if (!requests.length) return [];

  const requesterIds = [...new Set(requests.map(request => request.requester?._id?.toString()).filter(Boolean))];
  const topicNames = [...new Set(weakTopics.map(item => item.topic))];
  const peerProgress = await UserProgress.find({
    userId: { $in: requesterIds },
    topic: { $in: topicNames },
  });

  const masteryByUserAndTopic = new Map(
    peerProgress.map(item => [`${item.userId.toString()}::${normalizeSkill(item.topic)}`, item.mastery]),
  );

  return requests
    .map(request => {
      const requesterId = request.requester?._id?.toString();
      const peerSkillAreas = request.requester?.skillAreas || [];
      const target = weakTopics
        .map(topic => {
          const skillFit = skillMatchScore(request.teachSkill, topic.topic, peerSkillAreas);
          return { ...topic, skillFit };
        })
        .sort((a, b) => b.skillFit - a.skillFit)[0];

      const peerMastery = masteryByUserAndTopic.get(`${requesterId}::${normalizeSkill(target.topic)}`)
        ?? (target.skillFit >= 0.6 ? 0.65 : 0.45);
      const availabilityScore = request.scheduledAt
        ? new Date(request.scheduledAt).getTime() >= Date.now() ? 1 : 0.4
        : 0.85;
      const ratingScore = 1; // Placeholder until peer ratings are introduced.
      const score = (
        target.skillFit * 0.55
        + peerMastery * 0.30
        + availabilityScore * 0.10
        + ratingScore * 0.05
      );
      const peer = {
        id: request.requester?._id,
        name: getDisplayName(request.requester),
        skillAreas: peerSkillAreas,
      };

      return {
        request,
        peer,
        targetTopic: target.topic,
        targetMastery: Math.round((target.mastery || 0.25) * 100),
        score: Math.round(score * 100),
        scoreBreakdown: {
          skillFit: Math.round(target.skillFit * 100),
          peerMastery: Math.round(peerMastery * 100),
          availability: Math.round(availabilityScore * 100),
          rating: Math.round(ratingScore * 100),
        },
        reasons: recommendationReason({
          request,
          targetTopic: target.topic,
          skillFit: target.skillFit,
          peerMastery,
          availabilityScore,
        }),
      };
    })
    .sort((a, b) => b.score - a.score || new Date(b.request.createdAt) - new Date(a.request.createdAt))
    .slice(0, limit);
}

export async function createSkillSwapRequest(userId, payload) {
  if (payload.receiverId && payload.receiverId.toString() === userId.toString()) {
    throw new AppError("You cannot send a SkillSwap request to yourself", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  return SkillSwap.create({
    requester: userId,
    receiver: payload.receiverId || undefined,
    teachSkill: payload.teachSkill,
    learnSkill: payload.learnSkill,
    message: payload.message || "",
    status: payload.receiverId ? "pending" : "open",
    scheduledAt: payload.scheduledAt,
  });
}

export async function acceptSkillSwapRequest(id, userId) {
  const request = await SkillSwap.findById(id);
  if (!request) throw new AppError("SkillSwap request not found", 404, ERROR_CODES.NOT_FOUND);
  if (request.requester.toString() === userId.toString()) {
    throw new AppError("You cannot accept your own SkillSwap request", 400, ERROR_CODES.VALIDATION_ERROR);
  }
  if (request.receiver && request.receiver.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to accept this SkillSwap request", 403, ERROR_CODES.FORBIDDEN);
  }
  if (!["open", "pending"].includes(request.status)) {
    throw new AppError("Only open or pending SkillSwap requests can be accepted", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  request.receiver = request.receiver || userId;
  request.status = "accepted";
  await request.save();
  return request;
}

export async function declineSkillSwapRequest(id, userId) {
  const request = await SkillSwap.findById(id);
  if (!request) throw new AppError("SkillSwap request not found", 404, ERROR_CODES.NOT_FOUND);
  const canDecline = request.requester.toString() === userId.toString()
    || request.receiver?.toString() === userId.toString();

  if (!canDecline) {
    throw new AppError("You do not have permission to decline this SkillSwap request", 403, ERROR_CODES.FORBIDDEN);
  }
  if (!["open", "pending"].includes(request.status)) {
    throw new AppError("Only open or pending SkillSwap requests can be declined", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  request.status = "declined";
  await request.save();
  return request;
}

export async function cancelSkillSwapRequest(id, userId) {
  const request = await SkillSwap.findById(id);
  if (!request) throw new AppError("SkillSwap request not found", 404, ERROR_CODES.NOT_FOUND);
  if (request.requester.toString() !== userId.toString()) {
    throw new AppError("Only the requester can cancel this SkillSwap request", 403, ERROR_CODES.FORBIDDEN);
  }
  if (!["open", "pending"].includes(request.status)) {
    throw new AppError("Only open or pending SkillSwap requests can be cancelled", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  request.status = "cancelled";
  await request.save();
  return request;
}

export async function completeSkillSwapRequest(id, userId) {
  const request = await SkillSwap.findById(id);
  if (!request) throw new AppError("SkillSwap request not found", 404, ERROR_CODES.NOT_FOUND);
  const isParticipant = request.requester.toString() === userId.toString()
    || request.receiver?.toString() === userId.toString();

  if (!isParticipant) {
    throw new AppError("You do not have permission to complete this SkillSwap request", 403, ERROR_CODES.FORBIDDEN);
  }
  if (request.status !== "accepted") {
    throw new AppError("Only accepted SkillSwap requests can be completed", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  request.status = "completed";
  await request.save();
  return request;
}
