import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    name: String,
    service: String,
    location: String,
    description: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // THIS LINE IS MISSING IN YOUR APP
      required: true,
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      default: "open",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Request", requestSchema);
