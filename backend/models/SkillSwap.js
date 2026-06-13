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
    verificationProof: {
      proofType: {
        type: String,
        enum: ["resume", "certificate"],
        default: "resume",
      },
      fileName: {
        type: String,
        trim: true,
        default: "",
      },
      mimeType: {
        type: String,
        default: "",
      },
      fileSize: {
        type: Number,
        default: 0,
        min: 0,
      },
      dataUrl: {
        type: String,
        default: "",
        select: false,
      },
      status: {
        type: String,
        enum: ["submitted", "approved"],
        default: "submitted",
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
    },
    status: {
      type: String,
      enum: ["open", "pending", "accepted", "declined", "cancelled", "completed"],
      default: "open",
      index: true,
    },
    scheduledAt: Date,
    meetingUrl: {
      type: String,
      trim: true,
      default: "",
    },
    chat: {
      messages: [
        {
          sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          body: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model("SkillSwap", skillSwapSchema);
