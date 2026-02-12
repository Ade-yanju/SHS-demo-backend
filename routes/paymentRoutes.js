import express from "express";
import Payment from "../models/Payment.js";
import Job from "../models/Job.js";
import Quote from "../models/Quote.js";

const router = express.Router();

/* ==============================
   CREATE PAYMENT (HIRER PAYS)
============================== */

router.post("/create", async (req, res) => {
  try {
    const { jobId, hirerId, freelancerId, amount } = req.body;

    if (!jobId || !hirerId || !freelancerId || !amount) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const payment = await Payment.create({
      jobId,
      hirerId,
      freelancerId,
      amount,
      status: "pending",
    });

    res.json(payment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Payment creation failed" });
  }
});

/* ==============================
   MARK PAYMENT AS PAID
============================== */

router.put("/mark-paid/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "paid" },
      { new: true },
    );

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Failed to update payment" });
  }
});

/* ==============================
   RELEASE PAYMENT TO FREELANCER
   (Admin action)
============================== */

router.put("/release/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "released" },
      { new: true },
    );

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Release failed" });
  }
});

/* ==============================
   GET ALL PAYMENTS (ADMIN)
============================== */

router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments" });
  }
});

/* ==============================
   GET HIRER PAYMENTS
============================== */

router.get("/hirer/:id", async (req, res) => {
  try {
    const payments = await Payment.find({ hirerId: req.params.id });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching hirer payments" });
  }
});

/* ==============================
   GET FREELANCER PAYMENTS
============================== */

router.get("/freelancer/:id", async (req, res) => {
  try {
    const payments = await Payment.find({ freelancerId: req.params.id });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching freelancer payments" });
  }
});

/* ==============================
   ADMIN FREEZE PAYMENT
============================== */

router.put("/freeze/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "frozen" },
      { new: true },
    );

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Freeze failed" });
  }
});

export default router;
