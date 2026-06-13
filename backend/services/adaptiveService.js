import Assessment from "../models/Assessment.js";
import Problem from "../models/Problem.js";
import QuestionBank from "../models/QuestionBank.js";
import Submission from "../models/Submission.js";
import UserProgress from "../models/UserProgress.js";

// Bayesian Knowledge Tracing (BKT) parameters
const P_S = 0.15; // Probability of slip (knowing the skill but making a mistake)
const P_G = 0.25; // Probability of guess (getting it right without knowing the skill)
const P_T = 0.10; // Probability of transition (learning the skill after an attempt)

/**
 * Calculates updated BKT mastery probability based on response sequence.
 * @param {number} currentMastery Current P(known) probability
 * @param {Array<{isCorrect: boolean}>} answers Sequence of answers in this attempt
 * @returns {number} Updated P(known) probability
 */
export function updateBKT(currentMastery, answers = []) {
  let p = currentMastery !== undefined ? currentMastery : 0.25;

  for (const ans of answers) {
    let pConditional;
    if (ans.isCorrect) {
      pConditional = (p * (1 - P_S)) / (p * (1 - P_S) + (1 - p) * P_G);
    } else {
      pConditional = (p * P_S) / (p * P_S + (1 - p) * (1 - P_G));
    }
    // Update mastery with transition probability
    p = pConditional + (1 - pConditional) * P_T;
    // Bounding to keep it responsive
    p = Math.max(0.01, Math.min(0.99, p));
  }

  return p;
}

export function getDifficultyFromAverage(averageScore) {
  if (averageScore >= 80) return { currentDifficulty: "hard", status: "advanced" };
  if (averageScore >= 50) return { currentDifficulty: "medium", status: "intermediate" };
  return { currentDifficulty: "easy", status: "beginner" };
}

export async function updateProgressAfterSubmission({ userId, topic, score, correctCount, incorrectCount, answers = [] }) {
  const existing = await UserProgress.findOne({ userId, topic });
  const attemptCount = (existing?.attemptCount || 0) + 1;
  const previousTotal = (existing?.averageScore || 0) * (existing?.attemptCount || 0);
  const averageScore = Math.round((previousTotal + score) / attemptCount);

  // Bayesian Knowledge Tracing Mastery calculation
  const startMastery = existing && existing.mastery !== undefined ? existing.mastery : 0.25;
  const newMastery = updateBKT(startMastery, answers);

  // Map the new BKT mastery probability to difficulty and status
  let currentDifficulty = "easy";
  let status = "beginner";
  if (newMastery >= 0.75) {
    currentDifficulty = "hard";
    status = "advanced";
  } else if (newMastery >= 0.40) {
    currentDifficulty = "medium";
    status = "intermediate";
  }

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
      currentDifficulty,
      status,
      mastery: newMastery,
    },
    { upsert: true, new: true }
  );
}

function getTargetDifficultyFromMastery(mastery = 0.25) {
  if (mastery < 0.25) return 1;
  if (mastery < 0.45) return 2;
  if (mastery < 0.65) return 3;
  if (mastery < 0.85) return 4;
  return 5;
}

function defaultPracticeProgress() {
  return [
    {
      topic: "DSA",
      mastery: 0.25,
      currentDifficulty: "easy",
      status: "beginner",
      attemptCount: 0,
    },
    {
      topic: "JavaScript",
      mastery: 0.25,
      currentDifficulty: "easy",
      status: "beginner",
      attemptCount: 0,
    },
  ];
}

function publicQuestionDrill(question) {
  return {
    id: question._id,
    title: question.title,
    description: question.description,
    type: question.type,
    topic: question.topic,
    subtopic: question.subtopic,
    difficulty: question.difficulty,
    tags: question.tags,
    options: question.options,
  };
}

function publicAssessmentRecommendation(assessment) {
  return {
    id: assessment._id,
    title: assessment.title,
    desc: assessment.description || "",
    difficulty: assessment.difficulty,
    topic: assessment.topic,
    duration: assessment.duration,
    coinsReward: assessment.coinsReward,
    questions: [],
    isAdaptive: assessment.questionConfig?.isAdaptive || false,
    isDynamic: assessment.questionConfig?.isDynamic || false,
  };
}

function publicCodingProblem(problem) {
  return {
    id: problem._id,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
  };
}

function tagsForTopic(topic) {
  const normalized = topic.toLowerCase();
  const map = {
    dsa: ["stack", "strings", "warmup", "math"],
    javascript: ["warmup", "math"],
    backend: ["api", "database", "security"],
    webdev: ["strings", "warmup"],
    react: ["strings", "warmup"],
    python: ["warmup", "math"],
    oops: ["warmup"],
  };
  return map[normalized] || [normalized];
}

async function recentQuestionIdsForUser(userId) {
  const recent = await Submission.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("questionsShown");

  return [
    ...new Set(
      recent.flatMap((submission) => submission.questionsShown || []).map((id) => id.toString()),
    ),
  ];
}

export async function generatePersonalizedPracticeSet(userId) {
  const progressRecords = await UserProgress.find({ userId }).sort({ mastery: 1, updatedAt: -1 });
  const activeProgress = progressRecords.filter((item) => item.attemptCount > 0);
  const focusProgress = activeProgress.length ? activeProgress : defaultPracticeProgress();
  const focusTopics = focusProgress
    .slice(0, 2)
    .map((item) => ({
      topic: item.topic,
      mastery: item.mastery,
      masteryPercent: Math.round((item.mastery || 0.25) * 100),
      currentDifficulty: item.currentDifficulty,
      status: item.status,
      attemptCount: item.attemptCount,
    }));

  const primary = focusTopics[0];
  const targetDifficulty = getTargetDifficultyFromMastery(primary.mastery);
  const excludedIds = await recentQuestionIdsForUser(userId);
  const topicRegexes = focusTopics.map((item) => new RegExp(`^${item.topic}$`, "i"));

  const primaryTopicRegex = new RegExp(`^${primary.topic}$`, "i");

  let questionDrills = await QuestionBank.find({
    topic: { $regex: primaryTopicRegex },
    difficulty: {
      $gte: Math.max(1, targetDifficulty - 1),
      $lte: Math.min(5, targetDifficulty + 1),
    },
    ...(excludedIds.length ? { _id: { $nin: excludedIds } } : {}),
  })
    .select("-correctAnswer")
    .sort({ difficulty: 1, usageCount: 1 })
    .limit(5);

  if (questionDrills.length < 5) {
    const existingIds = questionDrills.map((question) => question._id.toString());
    const fallbackDrills = await QuestionBank.find({
      topic: { $in: topicRegexes },
      _id: { $nin: existingIds },
    })
      .select("-correctAnswer")
      .sort({ difficulty: 1, usageCount: 1 })
      .limit(5 - questionDrills.length);
    questionDrills = [...questionDrills, ...fallbackDrills];
  }

  let assessmentRecommendations = await Assessment.find({
    isActive: true,
    topic: { $regex: primaryTopicRegex },
  })
    .select("-questions.correctAnswer")
    .sort({ updatedAt: -1 })
    .limit(3);

  if (assessmentRecommendations.length === 0) {
    assessmentRecommendations = await Assessment.find({
      isActive: true,
      topic: { $in: topicRegexes },
    })
      .select("-questions.correctAnswer")
      .sort({ updatedAt: -1 })
      .limit(3);
  }

  const codingTags = [...new Set(focusTopics.flatMap((item) => tagsForTopic(item.topic)))];
  const codingProblems = await Problem.find({
    isActive: true,
    tags: { $in: codingTags },
  })
    .select("title difficulty tags")
    .sort({ difficulty: 1, createdAt: -1 })
    .limit(3);

  return {
    targetTopic: primary.topic,
    targetDifficulty,
    isStarter: !activeProgress.length,
    reason: activeProgress.length
      ? `${primary.topic} is currently your lowest BKT mastery area at ${primary.masteryPercent}%.`
      : "No completed attempts yet, so we are starting with core DSA and JavaScript fundamentals.",
    focusTopics,
    questionDrills: questionDrills.map(publicQuestionDrill),
    assessmentRecommendations: assessmentRecommendations.map(publicAssessmentRecommendation),
    codingProblems: codingProblems.map(publicCodingProblem),
    nextActions: [
      `Do the ${primary.topic} drill questions first without checking notes.`,
      "Run one recommended assessment to update your mastery profile.",
      "Use Coding Practice if a recommended problem appears for this topic.",
    ],
  };
}
