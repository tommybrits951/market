import mongoose from "mongoose";

const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    path: {
      required: true,
      type: String,
    },
    uploaded: {
      type: Date,
      default: new Date(),
    },
    profile: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Image", imageSchema);
