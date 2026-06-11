import UserProgress from "../models/UserProgress.js";

export function getDifficultyFromAverage(averageScore) {
  if (averageScore >= 80) return { currentDifficulty: "hard", status: "advanced" };
  if (averageScore >= 50) return { currentDifficulty: "medium", status: "intermediate" };
  return { currentDifficulty: "easy", status: "beginner" };
}

export async function updateProgressAfterSubmission({ userId, topic, score, correctCount, incorrectCount }) {
  const existing = await UserProgress.findOne({ userId, topic });
  const attemptCount = (existing?.attemptCount || 0) + 1;
  const previousTotal = (existing?.averageScore || 0) * (existing?.attemptCount || 0);
  const averageScore = Math.round((previousTotal + score) / attemptCount);
  const level = getDifficultyFromAverage(averageScore);

  return UserProgress.findOneAndUpdate(
    { userId, topic },
    {
      userId,
      topic,
      lastAssessmentScore: score,
      averageScore,
      attemptCount,
      correctAnswers: (existing?.correctAnswers || 0) + correctCount,
      incorrectAnswers: (existing?.incorrectAnswers || 0) + incorrectCount,
      ...level,
    },
    { upsert: true, new: true },
  );
}
