import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    stdin: {
      type: String,
      default: "",
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { timestamps: false },
);

const starterCodeSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      default: "",
    },
  },
  { timestamps: false },
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    statement: {
      type: String,
      required: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    inputFormat: {
      type: String,
      default: "",
    },
    outputFormat: {
      type: String,
      default: "",
    },
    testCases: {
      type: [testCaseSchema],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    supportedLanguages: {
      type: [String],
      default: ["javascript"],
    },
    starterCode: {
      type: [starterCodeSchema],
      default: [],
    },
    editorial: {
      type: String,
      default: "",
    },
    solutionCode: {
      type: String,
      default: "",
      select: false,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timeLimitMs: {
      type: Number,
      default: 2000,
      min: 100,
      max: 10000,
    },
    memoryLimitMb: {
      type: Number,
      default: 128,
      min: 16,
      max: 512,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Problem", problemSchema);
