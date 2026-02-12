import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    hirerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "GBP",
    },

    type: {
      type: String,
      enum: ["deposit", "milestone", "full", "release", "refund"],
      default: "deposit",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "held_in_escrow",
        "released",
        "completed",
        "failed",
        "refunded",
        "frozen",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "paypal"],
      default: "card",
    },

    transactionId: String,

    notes: String,

    paidAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Payment", PaymentSchema);
