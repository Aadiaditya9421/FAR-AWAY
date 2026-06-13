import mongoose from "mongoose";

const integrityEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    attemptId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["tab_hidden", "window_blur", "copy_attempt", "cut_attempt", "paste_attempt"],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

integrityEventSchema.index({ userId: 1, assessmentId: 1, attemptId: 1, createdAt: -1 });

export default mongoose.model("IntegrityEvent", integrityEventSchema);
