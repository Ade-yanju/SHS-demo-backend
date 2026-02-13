import express from "express";
import Quote from "../models/Quote.js";
import Request from "../models/Request.js";
import {
  verifyToken,
  hirerOnly,
  freelancerOnly,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ===============================
   CREATE QUOTE (FREELANCER)
================================ */
router.post("/", verifyToken, freelancerOnly, async (req, res) => {
  try {
    const { jobId, price, message } = req.body;

    if (!jobId || !price || !message) {
      return res.status(400).json({
        message: "jobId, price and message are required",
      });
    }

    // 1️⃣ Get the job to find the hirer
    const job = await Request.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 2️⃣ Create quote including hirerId
    const quote = await Quote.create({
      jobId,
      freelancerId: req.user.id,
      hirerId: job.userId, // 🔥 THIS FIXES YOUR ERROR
      price,
      message,
      status: "pending",
    });

    res.status(201).json(quote);
  } catch (err) {
    console.error("SEND QUOTE ERROR:", err);
    res.status(500).json({ message: "Failed to send quote" });
  }
});

/* ===============================
   GET QUOTES FOR JOB (HIRER)
================================ */
router.get("/job/:jobId", verifyToken, hirerOnly, async (req, res) => {
  const quotes = await Quote.find({ jobId: req.params.jobId }).populate(
    "freelancerId",
    "name email",
  );

  res.json(quotes);
});

/* ===============================
   ACCEPT QUOTE (MAIN FIX)
================================ */
router.put("/accept/:id", verifyToken, hirerOnly, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) return res.status(404).json({ message: "Quote not found" });

    // 1️⃣ mark selected quote accepted
    quote.status = "accepted";
    await quote.save();

    // 2️⃣ assign freelancer to request
    await Request.findByIdAndUpdate(quote.jobId, {
      status: "assigned",
      freelancerId: quote.freelancerId,
    });

    // 3️⃣ reject all other quotes automatically
    await Quote.updateMany(
      { jobId: quote.jobId, _id: { $ne: quote._id } },
      { status: "rejected" },
    );

    res.json({ message: "Freelancer assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept quote" });
  }
});

/* ===============================
   REJECT QUOTE
================================ */
router.put("/reject/:id", verifyToken, hirerOnly, async (req, res) => {
  await Quote.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.json({ message: "Quote rejected" });
});

router.get("/freelancer/:id", verifyToken, freelancerOnly, async (req, res) => {
  const quotes = await Quote.find({
    freelancerId: req.params.id,
    status: { $in: ["pending", "accepted"] },
  }).populate("jobId");

  res.json(quotes);
});

export default router;
