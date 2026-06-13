import mongoose from "mongoose";

const coinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ["assessment", "competition", "manual", "skillswap", "daily_bonus"],
      default: "manual",
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Coin", coinSchema);
