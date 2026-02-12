import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
  },

  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  hirerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  price: Number,
  message: String,

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Quote", quoteSchema);
