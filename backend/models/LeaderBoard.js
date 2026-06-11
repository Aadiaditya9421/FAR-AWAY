import mongoose from "mongoose";

const leaderBoardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
    coins: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner",
    },
  },
  { timestamps: true, collection: "leaderboards" },
);

leaderBoardSchema.index({ userId: 1, topic: 1 }, { unique: true });

export default mongoose.model("LeaderBoard", leaderBoardSchema);
