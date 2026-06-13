import Analytics from "../models/Analytics.js";
import Submission from "../models/Submission.js";
import UserProgress from "../models/UserProgress.js";

export async function recordMetric(payload) {
  return Analytics.create(payload);
}

export async function getProgressAnalytics(userId) {
  const [progress, submissions] = await Promise.all([
    UserProgress.find({ userId }).sort({ updatedAt: -1 }),
    Submission.find({ userId }).populate("assessmentId", "title topic difficulty").sort({ createdAt: -1 }).limit(10),
  ]);

  const attempts = submissions.length;
  const averageScore = attempts
    ? Math.round(submissions.reduce((sum, item) => sum + item.score, 0) / attempts)
    : 0;

  return {
    summary: {
      attempts,
      averageScore,
      topicsTracked: progress.length,
    },
    progress,
    recentSubmissions: submissions,
  };
}
