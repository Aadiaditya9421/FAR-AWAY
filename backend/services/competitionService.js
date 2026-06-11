import Competition from "../models/Competition.js";
import { debitCoins } from "./coinService.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { buildPaginationMeta, parsePagination } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";

export async function listCompetitions(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.topic) filter.topic = query.topic;

  const [items, total] = await Promise.all([
    Competition.find(filter).sort({ startDate: 1 }).skip(skip).limit(limit),
    Competition.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function createCompetition(payload, userId) {
  return Competition.create({ ...payload, createdBy: userId });
}

export async function getCompetition(id) {
  const competition = await Competition.findById(id).populate("participants", "firstName lastName email");
  if (!competition) throw new AppError("Competition not found", 404, ERROR_CODES.NOT_FOUND);
  return competition;
}

export async function joinCompetition(id, userId, payload = {}) {
  const competition = await Competition.findById(id);
  if (!competition) throw new AppError("Competition not found", 404, ERROR_CODES.NOT_FOUND);

  const alreadyJoined = competition.participants.some((participantId) => participantId.toString() === userId.toString());
  if (alreadyJoined) {
    throw new AppError("User already joined this competition", 409, ERROR_CODES.CONFLICT);
  }

  if (competition.entryFee > 0) {
    await debitCoins(userId, competition.entryFee, `Joined competition: ${competition.title}`, "competition", competition._id);
  }

  competition.participants.push(userId);

  if (competition.type === "group") {
    competition.teams.push({
      teamName: payload.teamName || `Team ${competition.teams.length + 1}`,
      members: payload.teamMembers?.length ? payload.teamMembers : [userId],
      score: 0,
    });
  }

  await competition.save();
  return competition;
}

export async function getCompetitionStandings(id) {
  const competition = await getCompetition(id);
  const standings = competition.type === "group"
    ? [...competition.teams].sort((a, b) => b.score - a.score)
    : competition.participants.map((participant, index) => ({
      rank: index + 1,
      participant,
      score: 0,
    }));

  return { competition, standings };
}
