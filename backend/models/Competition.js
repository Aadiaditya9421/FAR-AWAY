import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    roundName: {
      type: String,
      required: true,
    },
    questions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    duration: {
      type: Number,
      default: 30,
    },
  },
  { timestamps: false },
);

const teamSchema = new mongoose.Schema(
  {
    teamName: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    score: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["individual", "group"],
      required: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxTeams: {
      type: Number,
      default: 0,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    teams: {
      type: [teamSchema],
      default: [],
    },
    rounds: {
      type: [roundSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
      index: true,
    },
    prizePool: {
      rank1: { type: Number, default: 0 },
      rank2: { type: Number, default: 0 },
      rank3: { type: Number, default: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Competition", competitionSchema);
