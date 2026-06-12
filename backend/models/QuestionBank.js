import mongoose from "mongoose";

const questionBankSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["mcq", "code", "debug", "design", "dev"],
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      required: true,
      select: false, // Prevent leakage by default
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subtopic: {
      type: String,
      default: "",
      trim: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    successRate: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1.0,
    },
    points: {
      type: Number,
      default: 1,
      min: 0,
    },
    timeLimit: {
      type: Number,
      default: 0,
      min: 0, // 0 means no limit
    },
  },
  { timestamps: true }
);

// Compound index on topic, difficulty, and type for high-performance query selection
questionBankSchema.index({ topic: 1, difficulty: 1, type: 1 });

export default mongoose.model("QuestionBank", questionBankSchema);
