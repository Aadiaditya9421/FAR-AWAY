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
    description: {
      type: String,
      default: "",
      trim: true,
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
    questionConfig: {
      isDynamic: {
        type: Boolean,
        default: false,
      },
      isAdaptive: {
        type: Boolean,
        default: false,
      },
      count: {
        type: Number,
        default: 5,
      },
      preventRepeat: {
        type: Boolean,
        default: true,
      },
      difficultyRange: {
        min: {
          type: Number,
          default: 1,
          min: 1,
          max: 5,
        },
        max: {
          type: Number,
          default: 5,
          min: 1,
          max: 5,
        },
      },
    },
    coinsReward: {
      type: Number,
      default: 20,
      min: 0,
    },
    availableFrom: {
      type: Date,
      default: null,
      index: true,
    },
    availableTo: {
      type: Date,
      default: null,
      index: true,
    },
    assignment: {
      mode: {
        type: String,
        enum: ["all", "class", "students", "defaulters"],
        default: "all",
        index: true,
      },
      batch: {
        type: String,
        default: "",
        trim: true,
        index: true,
      },
      branch: {
        type: String,
        default: "",
        trim: true,
        index: true,
      },
      studentIds: {
        type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        }],
        default: [],
      },
      sourceAssessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
        default: null,
      },
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
