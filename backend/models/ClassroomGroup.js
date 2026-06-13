import mongoose from "mongoose";

const classroomGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ClassroomGroup", classroomGroupSchema);
