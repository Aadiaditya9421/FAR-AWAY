import { getProgressAnalytics } from "../services/analyticsService.js";
import { generatePersonalizedPracticeSet } from "../services/adaptiveService.js";
import { sendSuccess } from "../utils/responseHandler.js";

export async function getProgress(req, res) {
  const data = await getProgressAnalytics(req.user._id);
  return sendSuccess(res, { message: "Progress analytics retrieved", data });
}

export async function getPracticeSet(req, res) {
  const data = await generatePersonalizedPracticeSet(req.user._id);
  return sendSuccess(res, { message: "Personalized practice set retrieved", data });
}
