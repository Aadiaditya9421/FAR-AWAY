import { getProgressAnalytics } from "../services/analyticsService.js";
import { sendSuccess } from "../utils/responseHandler.js";

export async function getProgress(req, res) {
  const data = await getProgressAnalytics(req.user._id);
  return sendSuccess(res, { message: "Progress analytics retrieved", data });
}
