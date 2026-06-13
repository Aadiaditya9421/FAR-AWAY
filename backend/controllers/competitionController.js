import {
  createCompetition,
  getCompetitionStandings,
  joinCompetition,
  listCompetitions,
} from "../services/competitionService.js";
import { sendCreated, sendSuccess } from "../utils/responseHandler.js";

export async function getCompetitions(req, res) {
  const { items, meta } = await listCompetitions(req.query);
  return sendSuccess(res, { message: "Competitions retrieved", data: items, meta });
}

export async function createCompetitionRecord(req, res) {
  const competition = await createCompetition(req.body, req.user._id);
  return sendCreated(res, { message: "Competition created", data: competition });
}

export async function joinCompetitionRecord(req, res) {
  const competition = await joinCompetition(req.params.id, req.user._id, req.body);
  return sendSuccess(res, { message: "Competition joined", data: competition });
}

export async function getStandings(req, res) {
  const data = await getCompetitionStandings(req.params.id);
  return sendSuccess(res, { message: "Competition standings retrieved", data });
}
