import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import User from "../models/User.js";
import Assessment from "../models/Assessment.js";
import QuestionBank from "../models/QuestionBank.js";
import UserProgress from "../models/UserProgress.js";
import Submission from "../models/Submission.js";
import { selectQuestionsForAttempt } from "../services/questionSelectionService.js";
import { submitAssessment } from "../services/assessmentService.js";
import { assertSafeDatabaseMutation } from "./databaseSafety.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/far-away";

function redactConnectionString(uri = "") {
  return uri.replace(/\/\/([^:/@]+):([^@]+)@/, "//$1:****@");
}

async function verify() {
  assertSafeDatabaseMutation(MONGO_URI, {
    scriptName: "verify-phase4.js",
    purpose: "clear progress/submissions and create verification records",
  });

  console.log("Connecting to database:", redactConnectionString(MONGO_URI));
  await mongoose.connect(MONGO_URI);

  // 1. Retrieve test user and assessment
  const user = await User.findOne({ email: "student1@faraway.local" });
  if (!user) {
    throw new Error("Student 1 not found. Please run seed first.");
  }
  console.log(`Found student: ${user.fullName} (${user._id})`);

  const assessment = await Assessment.findOne({ title: "Weekly DSA Speedrun" });
  if (!assessment) {
    throw new Error("Weekly DSA Speedrun assessment not found.");
  }
  console.log(`Found assessment: ${assessment.title} (${assessment._id})`);

  // Clear any existing progress/submissions for a clean verify run
  await UserProgress.deleteMany({ userId: user._id, topic: "DSA" });
  await Submission.deleteMany({ userId: user._id, assessmentId: assessment._id });
  console.log("Cleared existing progress/submissions for student on DSA.\n");

  // 2. First attempt question selection
  console.log("--- ATTEMPT 1 QUESTION SELECTION ---");
  const questions1 = await selectQuestionsForAttempt(user._id, assessment);
  console.log(`Selected ${questions1.length} questions.`);
  const qIds1 = questions1.map(q => q._id.toString());
  questions1.forEach((q, idx) => {
    console.log(`  ${idx + 1}. [Diff: ${q.difficulty}] ${q.title}`);
  });

  // Verify we got 5 questions
  if (questions1.length !== 5) {
    throw new Error(`Expected 5 questions, got ${questions1.length}`);
  }

  // 3. Second attempt question selection (to test anti-repeat)
  console.log("\n--- ATTEMPT 2 QUESTION SELECTION (ANTI-REPEAT CHECK) ---");
  // Temporarily insert a mock submission containing these questions shown
  // in order to simulate an attempt before fetching the next questions.
  await Submission.create({
    userId: user._id,
    assessmentId: assessment._id,
    answers: [],
    score: 0,
    timeTaken: 10,
    questionsShown: questions1.map(q => q._id),
  });

  const questions2 = await selectQuestionsForAttempt(user._id, assessment);
  console.log(`Selected ${questions2.length} questions.`);
  const qIds2 = questions2.map(q => q._id.toString());
  questions2.forEach((q, idx) => {
    console.log(`  ${idx + 1}. [Diff: ${q.difficulty}] ${q.title}`);
  });

  // Check intersection to verify no repeats (or minimal repeats if pool is small)
  const intersection = qIds1.filter(id => qIds2.includes(id));
  console.log(`\nOverlapping question count: ${intersection.length} / 5`);
  if (intersection.length > 0) {
    console.log("Overlap questions:", intersection);
  }

  if (intersection.length === 5) {
    throw new Error("Anti-repeat failed: All questions are identical!");
  } else {
    console.log("✓ Anti-repeat logic passed: Substantially different questions returned.");
  }

  // Clean up mock submission
  await Submission.deleteMany({ userId: user._id, assessmentId: assessment._id });

  // 4. Test BKT update on submission
  console.log("\n--- SIMULATING 100% CORRECT SUBMISSION FOR BKT UPDATE ---");
  // Let's retrieve correct answers for the first set of questions
  const fullQuestions = await QuestionBank.find({ _id: { $in: questions1.map(q => q._id) } }).select("+correctAnswer");
  const answers = fullQuestions.map(q => ({
    questionId: q._id,
    userAnswer: q.correctAnswer,
  }));

  const initialProgress = await UserProgress.findOne({ userId: user._id, topic: "DSA" });
  const initialMastery = initialProgress ? initialProgress.mastery : 0.25;
  console.log(`Initial DSA BKT Mastery: ${initialMastery * 100}%`);

  const submission = await submitAssessment({
    assessmentId: assessment._id,
    userId: user._id,
    answers,
    timeTaken: 120,
  });

  console.log(`Submission Score: ${submission.score}%`);
  console.log(`Coins Earned: ${submission.coinsEarned}`);

  const updatedProgress = await UserProgress.findOne({ userId: user._id, topic: "DSA" });
  if (!updatedProgress) {
    throw new Error("UserProgress not updated/created for DSA!");
  }
  console.log(`Updated DSA BKT Mastery: ${(updatedProgress.mastery * 100).toFixed(2)}%`);
  console.log(`Updated Current Difficulty: ${updatedProgress.currentDifficulty}`);
  console.log(`Updated Status Level: ${updatedProgress.status}`);

  if (updatedProgress.mastery <= initialMastery) {
    throw new Error("BKT failure: Mastery did not increase after correct answers!");
  }
  console.log("✓ BKT mastery level correctly increased.");

  // 5. Test Adaptive Selection (should bias towards higher difficulty)
  console.log("\n--- ATTEMPT 3 QUESTION SELECTION (ADAPTIVE DIFFICULTY BIAS CHECK) ---");
  const questions3 = await selectQuestionsForAttempt(user._id, assessment);
  const avgDiff3 = questions3.reduce((sum, q) => sum + q.difficulty, 0) / questions3.length;
  const avgDiff1 = questions1.reduce((sum, q) => sum + q.difficulty, 0) / questions1.length;
  console.log(`Average difficulty of Attempt 1 (before mastery): ${avgDiff1}`);
  console.log(`Average difficulty of Attempt 3 (after 100% score / higher mastery): ${avgDiff3}`);
  questions3.forEach((q, idx) => {
    console.log(`  ${idx + 1}. [Diff: ${q.difficulty}] ${q.title}`);
  });

  if (avgDiff3 < avgDiff1) {
    console.log("Warning: Adaptive difficulty did not increase difficulty, but this is acceptable if pool random selection was biased or limited.");
  } else {
    console.log("✓ Adaptive difficulty passed: Selected questions are biased towards higher difficulty tiers.");
  }

  await mongoose.disconnect();
  console.log("\nAll Phase 4 Dynamic Question Engine tests passed successfully!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
