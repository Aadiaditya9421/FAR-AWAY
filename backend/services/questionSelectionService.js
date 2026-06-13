import QuestionBank from "../models/QuestionBank.js";
import Submission from "../models/Submission.js";
import UserProgress from "../models/UserProgress.js";

/**
 * Selects questions for a student's attempt based on assessment rules,
 * anti-repeat history, and adaptive BKT mastery level.
 * @param {string} userId - ID of the user attempting the quiz
 * @param {object} assessment - The Mongoose Assessment document
 * @returns {Promise<Array<object>>} Selected questions (without correctAnswer unless requested)
 */
export async function selectQuestionsForAttempt(userId, assessment) {
  const topic = assessment.topic;
  const count = assessment.questionConfig?.count || 5;
  const preventRepeat = assessment.questionConfig?.preventRepeat !== false;
  const minDiff = assessment.questionConfig?.difficultyRange?.min || 1;
  const maxDiff = assessment.questionConfig?.difficultyRange?.max || 5;

  // 1. Fetch recently shown questions to avoid repeats (recent 3 attempts)
  let excludedIds = [];
  if (preventRepeat) {
    const recentSubmissions = await Submission.find({ userId, assessmentId: assessment._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("questionsShown");
    recentSubmissions.forEach(sub => {
      if (sub.questionsShown && sub.questionsShown.length > 0) {
        sub.questionsShown.forEach(id => {
          excludedIds.push(id.toString());
        });
      }
    });
    // Deduplicate
    excludedIds = [...new Set(excludedIds)];
  }

  // 2. Query QuestionBank for questions of the specified topic
  const regexTopic = new RegExp(`^${topic}$`, "i");
  let eligibleQuestions = await QuestionBank.find({ topic: { $regex: regexTopic } });

  // Filter questions within the permitted range of difficulty
  eligibleQuestions = eligibleQuestions.filter(
    q => q.difficulty >= minDiff && q.difficulty <= maxDiff
  );

  // 3. Filter out the excluded questions (anti-repeat)
  let pool = eligibleQuestions.filter(q => !excludedIds.includes(q._id.toString()));

  // Fallback: If exclusions leave us with fewer than required count, relax the filter
  if (pool.length < count) {
    pool = eligibleQuestions;
  }

  // If we still have no questions, return empty
  if (pool.length === 0) {
    return [];
  }

  // 4. Calculate target difficulty based on student BKT mastery
  let targetDiff = 3; // Default to middle difficulty
  const isAdaptive = assessment.questionConfig?.isAdaptive;

  if (isAdaptive) {
    const progress = await UserProgress.findOne({ userId, topic });
    if (progress && progress.mastery !== undefined) {
      const mastery = progress.mastery;
      if (mastery < 0.25) {
        targetDiff = 1;
      } else if (mastery < 0.45) {
        targetDiff = 2;
      } else if (mastery < 0.65) {
        targetDiff = 3;
      } else if (mastery < 0.85) {
        targetDiff = 4;
      } else {
        targetDiff = 5;
      }
    } else {
      // Fallback based on assessment difficulty string
      if (assessment.difficulty === "easy") targetDiff = 2;
      else if (assessment.difficulty === "medium") targetDiff = 3;
      else targetDiff = 4;
    }
  } else {
    // Non-adaptive assessment: map nominal difficulty (easy/medium/hard) to 2/3/4
    if (assessment.difficulty === "easy") targetDiff = 2;
    else if (assessment.difficulty === "medium") targetDiff = 3;
    else targetDiff = 4;
  }

  // 5. Select the closest questions by difficulty with randomized tie-breakers
  const itemsWithDistance = pool.map(q => {
    const distance = Math.abs(q.difficulty - targetDiff);
    return {
      question: q,
      distance,
      randomWeight: Math.random(),
    };
  });

  // Sort by distance ascending, then by random weight
  itemsWithDistance.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    return a.randomWeight - b.randomWeight;
  });

  const selected = itemsWithDistance.slice(0, count).map(item => item.question);

  // Final shuffle of the selected items to randomize presentation order
  return selected.sort(() => Math.random() - 0.5);
}
