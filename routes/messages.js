import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/:jobId", async (req, res) => {
  const messages = await Message.find({
    jobId: req.params.jobId,
  });

  res.json(messages);
});

export default router;
