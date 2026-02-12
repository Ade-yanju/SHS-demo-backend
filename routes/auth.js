import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ===============================
   SIGNUP
================================ */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // freelancers require approval
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      approved: role === "freelancer" ? false : true,
    });

    res.status(201).json({
      message:
        role === "freelancer"
          ? "Signup successful. Await admin approval."
          : "Signup successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

/* ===============================
   LOGIN
================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    // freelancer approval check
    if (user.role === "freelancer" && !user.approved) {
      return res.status(403).json({
        message: "Your freelancer account is pending admin approval.",
      });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

/* ===============================
   ADMIN: GET PENDING FREELANCERS
================================ */
router.get("/pending-freelancers", async (req, res) => {
  try {
    const freelancers = await User.find({
      role: "freelancer",
      approved: false,
    });

    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching freelancers" });
  }
});

/* ===============================
   ADMIN: APPROVE FREELANCER
================================ */
router.put("/approve/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      approved: true,
    });

    res.json({ message: "Freelancer approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

/* ===============================
   ADMIN: REJECT FREELANCER
================================ */
router.delete("/reject/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Freelancer rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

export default router;
