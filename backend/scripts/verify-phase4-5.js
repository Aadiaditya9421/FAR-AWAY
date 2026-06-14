import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import User from "../models/User.js";
import Submission from "../models/Submission.js";
import { analyzeWeaknessesAndRecommend, explainMisconception } from "../services/learningInsightService.js";
import { assertSafeDatabaseMutation } from "./databaseSafety.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skillpath";

function redactConnectionString(uri = "") {
  return uri.replace(/\/\/([^:/@]+):([^@]+)@/, "//$1:****@");
}

async function verify() {
  assertSafeDatabaseMutation(MONGO_URI, {
    scriptName: "verify-phase4-5.js",
    purpose: "create temporary verification submissions",
  });

  console.log("Connecting to database:", redactConnectionString(MONGO_URI));
  await mongoose.connect(MONGO_URI);

  // 1. Retrieve test user
  const user = await User.findOne({ email: "student1@skillpath.local" });
  if (!user) {
    throw new Error("Student 1 not found. Please run seed first.");
  }
  console.log(`Found student: ${user.fullName} (${user._id})`);

  // 2. Fetch learning insights (should trigger the mock or real LLM depending on env)
  console.log("\n--- TESTING LEARNING INSIGHTS ---");
  const insights = await analyzeWeaknessesAndRecommend(user._id);
  console.log("Insights payload returned:");
  console.log(JSON.stringify(insights, null, 2));

  // Assert insights structure
  if (!insights || typeof insights !== "object") {
    throw new Error("Expected insights to be an object");
  }
  const requiredFields = ["weakAreas", "reason", "nextTopics", "personalizedRecommendation", "strengths", "masterySummary"];
  for (const field of requiredFields) {
    if (insights[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  console.log("✓ Learning insights structure is correct.");

  // 3. Test Misconception Explanation
  console.log("\n--- TESTING MISCONCEPTION EXPLANATION ---");
  
  // Find a real question from QuestionBank
  const realQuestion = await mongoose.model("QuestionBank").findOne({});
  if (!realQuestion) {
    throw new Error("No questions found in QuestionBank to run explanation test.");
  }
  
  // Create a temporary submission with an incorrect answer for this question
  const tempSubmission = await Submission.create({
    userId: user._id,
    assessmentId: new mongoose.Types.ObjectId(),
    answers: [
      {
        questionId: realQuestion._id,
        userAnswer: "This is a wrong answer choice",
        correctAnswer: realQuestion.correctAnswer || "The correct answer",
        isCorrect: false,
      }
    ],
    score: 0,
    timeTaken: 10,
  });

  console.log(`Created temp submission ${tempSubmission._id} using real question ${realQuestion._id} ("${realQuestion.title}")`);

  // Call explanation service
  const explanation = await explainMisconception(tempSubmission._id, realQuestion._id);
  console.log("\nExplanation returned:");
  console.log(explanation);
  
  // Clean up
  await Submission.deleteOne({ _id: tempSubmission._id });

  if (!explanation || typeof explanation !== "string" || explanation.length < 10) {
    throw new Error("Expected explanation to be a non-empty string");
  }
  console.log("✓ Misconception explanation returned successfully.");

  await mongoose.disconnect();
  console.log("\nAll Phase 4.5 LLM-Assisted Adaptive Engine service tests passed successfully!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
