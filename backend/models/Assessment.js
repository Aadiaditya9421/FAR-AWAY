import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mcq", "code", "debug", "design", "dev"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      default: "",
      select: false,
    },
    points: {
      type: Number,
      default: 1,
      min: 0,
    },
    timeLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: false },
);

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    coinsReward: {
      type: Number,
      default: 20,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

assessmentSchema.pre("save", function setQuestionCount(next) {
  this.totalQuestions = this.questions.length;
  next();
});

export default mongoose.model("Assessment", assessmentSchema);
