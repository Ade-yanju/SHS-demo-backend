import express from "express";
import Quote from "../models/Quote.js";

const router = express.Router();

/* CREATE QUOTE */
router.post("/", async (req, res) => {
  const quote = await Quote.create(req.body);
  res.json(quote);
});

/* GET QUOTES FOR JOB */
router.get("/job/:jobId", async (req, res) => {
  const quotes = await Quote.find({ jobId: req.params.jobId });
  res.json(quotes);
});

/* GET FREELANCER QUOTES */
router.get("/freelancer/:id", async (req, res) => {
  const quotes = await Quote.find({ freelancerId: req.params.id });
  res.json(quotes);
});

/* ACCEPT QUOTE */
router.put("/accept/:id", async (req, res) => {
  await Quote.findByIdAndUpdate(req.params.id, {
    status: "accepted",
  });

  res.send("Quote accepted");
});

/* REJECT QUOTE */
router.put("/reject/:id", async (req, res) => {
  await Quote.findByIdAndUpdate(req.params.id, {
    status: "rejected",
  });

  res.send("Quote rejected");
});

export default router;
