import mongoose from "mongoose";

const skillSwapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    teachSkill: {
      type: String,
      required: true,
      trim: true,
    },
    learnSkill: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "pending", "accepted", "declined", "cancelled", "completed"],
      default: "open",
      index: true,
    },
    scheduledAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("SkillSwap", skillSwapSchema);
