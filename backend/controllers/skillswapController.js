import {
  acceptSkillSwapRequest,
  createSkillSwapRequest,
  declineSkillSwapRequest,
  listSkillSwapRequests,
  recommendSkillSwapPeers,
} from "../services/skillswapService.js";
import { sendCreated, sendSuccess } from "../utils/responseHandler.js";

export async function getRequests(req, res) {
  const { items, meta } = await listSkillSwapRequests(req.user._id, req.query);
  return sendSuccess(res, { message: "SkillSwap requests retrieved", data: items, meta });
}

export async function getRecommendedPeers(req, res) {
  const items = await recommendSkillSwapPeers(req.user._id, req.query);
  return sendSuccess(res, { message: "Recommended SkillSwap peers retrieved", data: items });
}

export async function postRequest(req, res) {
  const request = await createSkillSwapRequest(req.user._id, req.body);
  return sendCreated(res, { message: "SkillSwap request created", data: request });
}

export async function acceptRequest(req, res) {
  const request = await acceptSkillSwapRequest(req.params.id, req.user._id);
  return sendSuccess(res, { message: "SkillSwap request accepted", data: request });
}

export async function declineRequest(req, res) {
  const request = await declineSkillSwapRequest(req.params.id, req.user._id);
  return sendSuccess(res, { message: "SkillSwap request declined", data: request });
}
