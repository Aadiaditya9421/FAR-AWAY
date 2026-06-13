import { getTopicLeaderboard, getUserRankings } from "../services/leaderboardService.js";
import { sendSuccess } from "../utils/responseHandler.js";

export async function getLeaderboardByTopic(req, res) {
  const { items, meta } = await getTopicLeaderboard(req.params.topic, req.query);
  return sendSuccess(res, { message: "Leaderboard retrieved", data: items, meta });
}

export async function getUserLeaderboardRankings(req, res) {
  const data = await getUserRankings(req.params.userId);
  return sendSuccess(res, { message: "User rankings retrieved", data });
}
