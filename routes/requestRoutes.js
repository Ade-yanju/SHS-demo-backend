import express from "express";
import Request from "../models/Request.js";
import {
  verifyToken,
  hirerOnly,
  freelancerOnly,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ===============================
   CREATE REQUEST (HIRER ONLY)
================================ */
router.post("/", verifyToken, hirerOnly, async (req, res) => {
  try {
    const newRequest = new Request({
      ...req.body,
      userId: req.user.id,
      status: "open",
    });

    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (err) {
    console.log("CREATE REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to create request" });
  }
});

/* ===============================
   MARKETPLACE (FREELANCERS ONLY)
================================ */
router.get("/", verifyToken, freelancerOnly, async (req, res) => {
  try {
    const requests = await Request.find({ status: "open" })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    res.json(requests);
  } catch (err) {
    console.log("GET REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

/* ===============================
   HIRER OWN REQUESTS
================================ */
router.get("/hirer/:id", verifyToken, hirerOnly, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.params.id }).sort({
      createdAt: -1,
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hirer requests" });
  }
});

/* ===============================
   UPDATE REQUEST STATUS
================================ */
router.put("/:id", verifyToken, hirerOnly, async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update request" });
  }
});

export default router;
