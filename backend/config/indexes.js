import mongoose from "mongoose";

/**
 * Creates MongoDB indexes for hot query paths.
 * Mongoose automatically builds indexes defined in schemas, but defining them
 * explicitly here guarantees that compound and performance-critical indexes
 * are verified and built during application bootstrap.
 */
export async function ensureIndexes() {
  console.log("Verifying and building MongoDB indexes...");

  try {
    // 1. Submissions indexes
    // Compound index to quickly find user attempts for a specific assessment
    await mongoose.connection.collection("submissions").createIndex(
      { userId: 1, assessmentId: 1 },
      { name: "idx_submissions_user_assessment" }
    );
    // Index on createdAt to support listing submissions in chronological order
    await mongoose.connection.collection("submissions").createIndex(
      { createdAt: -1 },
      { name: "idx_submissions_created_at" }
    );

    // 2. Assessments indexes
    // Compound index for topic and difficulty filtering
    await mongoose.connection.collection("assessments").createIndex(
      { topic: 1, difficulty: 1 },
      { name: "idx_assessments_topic_difficulty" }
    );
    // Index on createdBy to list assessments created by a specific teacher
    await mongoose.connection.collection("assessments").createIndex(
      { createdBy: 1 },
      { name: "idx_assessments_created_by" }
    );

    // 3. Leaderboard indexes
    // Compound index for listing topic-based leaderboards sorted by rank
    await mongoose.connection.collection("leaderboards").createIndex(
      { topic: 1, rank: 1 },
      { name: "idx_leaderboard_topic_rank" }
    );

    // 4. SkillSwap indexes
    // Indexes on teach/learn skills and status for matching queries
    await mongoose.connection.collection("skillswaps").createIndex(
      { status: 1, teachSkill: 1 },
      { name: "idx_skillswaps_status_teach" }
    );
    await mongoose.connection.collection("skillswaps").createIndex(
      { status: 1, learnSkill: 1 },
      { name: "idx_skillswaps_status_learn" }
    );

    // 5. Coins indexes
    // History listing sorted by transaction date
    await mongoose.connection.collection("coins").createIndex(
      { userId: 1, createdAt: -1 },
      { name: "idx_coins_user_date" }
    );

    // 6. QuestionBank indexes
    await mongoose.connection.collection("questionbanks").createIndex(
      { topic: 1, difficulty: 1, type: 1 },
      { name: "idx_questionbank_topic_diff_type" }
    );
 
    console.log("MongoDB indexes verified successfully.");
  } catch (err) {
    console.error("Failed to build MongoDB indexes:", err);
    // Do not crash the app if indexes fail, but log it clearly
  }
}
