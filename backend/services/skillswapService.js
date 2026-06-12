import SkillSwap from "../models/SkillSwap.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { buildPaginationMeta, parsePagination } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";

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

export async function createSkillSwapRequest(userId, payload) {
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

  request.receiver = request.receiver || userId;
  request.status = "accepted";
  await request.save();
  return request;
}

export async function declineSkillSwapRequest(id) {
  const request = await SkillSwap.findById(id);
  if (!request) throw new AppError("SkillSwap request not found", 404, ERROR_CODES.NOT_FOUND);

  request.status = "declined";
  await request.save();
  return request;
}
