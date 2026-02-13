import express from "express";
import Request from "../models/Request.js";
import {
  verifyToken,
  hirerOnly,
  freelancerOnly,
} from "../middlewares/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

/* ===============================
   CREATE REQUEST (HIRER ONLY)
================================ */
router.post("/", verifyToken, hirerOnly, async (req, res) => {
  try {
    const request = await Request.create({
      name: req.body.name,
      service: req.body.service,
      location: req.body.location,
      description: req.body.description,
      userId: req.user.id,
      status: "open",
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to create request" });
  }
});

/* ===============================
   MARKETPLACE (ONLY OPEN JOBS)
================================ */
router.get("/", verifyToken, freelancerOnly, async (req, res) => {
  try {
    const requests = await Request.find({ status: "open" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

/* ===============================
   HIRER OWN JOBS
================================ */
router.get("/my", verifyToken, hirerOnly, async (req, res) => {
  try {
    const jobs = await Request.find({ userId: req.user.id })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load jobs" });
  }
});

/* ===============================
   SINGLE JOB DETAILS
================================ */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const job = await Request.findById(req.params.id)
      .populate("userId", "name email")
      .populate("freelancerId", "name email");

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to load job" });
  }
});
router.get("/hirer/:id", async (req, res) => {
  try {
    const hirerId = new mongoose.Types.ObjectId(req.params.id);

    const jobs = await Request.find({ userId: hirerId })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.log("HIRER JOB FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to load jobs" });
  }
});

router.get("/hirer/my-jobs", verifyToken, hirerOnly, async (req, res) => {
  const jobs = await Request.find({ userId: req.user.id }).populate(
    "freelancerId",
    "name email",
  );

  res.json(jobs);
});

/* ======================================
   GET FREELANCER ACTIVE JOBS
====================================== */
router.get(
  "/freelancer/my-jobs",
  verifyToken,
  freelancerOnly,
  async (req, res) => {
    try {
      const jobs = await Request.find({
        freelancerId: req.user.id,
        status: { $in: ["assigned", "in-progress"] },
      }).populate("userId", "name email");

      res.json(jobs);
    } catch (err) {
      res.status(500).json({ message: "Failed to load freelancer jobs" });
    }
  },
);

export default router;
