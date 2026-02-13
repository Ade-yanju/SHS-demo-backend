import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/:jobId/:receiverId", async (req, res) => {
  try {
    const roomId = `${req.params.jobId}_${req.params.receiverId}`;

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages" });
  }
});

export default router;
