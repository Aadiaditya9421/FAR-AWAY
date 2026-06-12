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

  const teamName = payload.teamName || `Team ${competition.teams.length + 1}`;
  const teamMembers = payload.teamMembers?.length ? payload.teamMembers : [userId];
  const update = {
    $addToSet: { participants: userId },
  };

  if (competition.type === "group") {
    update.$push = {
      teams: {
        teamName,
        members: teamMembers,
        score: 0,
      },
    };
  }

  const joinedCompetition = await Competition.findOneAndUpdate(
    {
      _id: id,
      participants: { $ne: userId },
    },
    update,
    { new: true },
  );

  if (!joinedCompetition) {
    throw new AppError("User already joined this competition", 409, ERROR_CODES.CONFLICT);
  }

  try {
    if (competition.entryFee > 0) {
      await debitCoins(userId, competition.entryFee, `Joined competition: ${competition.title}`, "competition", competition._id);
    }
  } catch (error) {
    const rollback = { $pull: { participants: userId } };
    if (competition.type === "group") {
      rollback.$pull.teams = { teamName, members: userId };
    }
    await Competition.updateOne({ _id: id }, rollback);
    throw error;
  }

  return joinedCompetition;
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
