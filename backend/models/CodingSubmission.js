import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema(
  {
    name: String,
    verdict: {
      type: String,
      enum: ["AC", "WA", "TLE", "RE", "CE"],
      required: true,
    },
    status: String,
    stdout: String,
    stderr: String,
    expectedOutput: String,
    timeMs: Number,
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false },
);

const codingSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    verdict: {
      type: String,
      enum: ["AC", "WA", "TLE", "RE", "CE"],
      required: true,
      index: true,
    },
    passedCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    results: {
      type: [testResultSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("CodingSubmission", codingSubmissionSchema);
