import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    service: String,
    location: String,
    description: String,
    status: {
      type: String,
      default: "open",
    },
    hirerId: String,
  },
  { timestamps: true },
);

export default mongoose.model("Job", JobSchema);
