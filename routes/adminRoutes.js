import express from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Quote from "../models/Quote.js";
import Payment from "../models/Payment.js";
import { verifyToken, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* LOCK ALL ADMIN ROUTES */
router.use(verifyToken, adminOnly);

/* ===============================
   ADMIN STATS
================================ */
router.get("/stats", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const freelancers = await User.countDocuments({ role: "freelancer" });
    const hirers = await User.countDocuments({ role: "hirer" });
    const jobs = await Job.countDocuments();

    const payments = await Payment.find({ status: "released" });
    const revenue = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

    res.json({ users, freelancers, hirers, jobs, revenue });
  } catch (err) {
    console.log("ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Stats error" });
  }
});

/* USERS */
router.get("/users", async (req, res) => {
  res.json(await User.find().sort({ createdAt: -1 }));
});

/* JOBS */
router.get("/jobs", async (req, res) => {
  res.json(await Job.find().sort({ createdAt: -1 }));
});

/* QUOTES */
router.get("/quotes", async (req, res) => {
  res.json(await Quote.find().sort({ createdAt: -1 }));
});

/* PAYMENTS */
router.get("/payments", async (req, res) => {
  res.json(await Payment.find().sort({ createdAt: -1 }));
});

/* ACTIONS */

router.put("/suspend/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { suspended: true });
  res.json({ message: "User suspended" });
});

router.put("/cancel-job/:id", async (req, res) => {
  await Job.findByIdAndUpdate(req.params.id, { status: "cancelled" });
  res.json({ message: "Job cancelled" });
});

router.delete("/delete-quote/:id", async (req, res) => {
  await Quote.findByIdAndDelete(req.params.id);
  res.json({ message: "Quote removed" });
});

router.put("/freeze-payment/:id", async (req, res) => {
  await Payment.findByIdAndUpdate(req.params.id, { status: "frozen" });
  res.json({ message: "Payment frozen" });
});

export default router;
