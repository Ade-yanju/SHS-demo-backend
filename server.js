import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

/* ROUTES */
import requestRoutes from "./routes/requestRoutes.js";
import authRoutes from "./routes/auth.js";
import quoteRoutes from "./routes/quotes.js";
import messageRoutes from "./routes/messages.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

/* MODELS */
import Message from "./models/Message.js";
import Notification from "./models/Notification.js";

dotenv.config();

/* ======================
   APP INIT
====================== */

const app = express();
const server = http.createServer(app);

/* ======================
   SOCKET.IO
====================== */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/* ======================
   MIDDLEWARE
====================== */

app.use(cors());
app.use(express.json());

/* REQUEST LOGGER (VERY IMPORTANT FOR ADMIN MONITORING) */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ======================
   DATABASE
====================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB ERROR:", err));

/* ======================
   ROUTES
====================== */

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

/* ======================
   SOCKET REALTIME SYSTEM
====================== */

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  /* JOIN PROJECT ROOM */
  socket.on("joinRoom", ({ jobId, userId }) => {
    socket.join(jobId);
    console.log(`${userId} joined job room ${jobId}`);
  });

  /* SEND MESSAGE */
  socket.on("sendMessage", async (data) => {
    try {
      const message = await Message.create(data);

      /* EMIT TO ROOM */
      io.to(data.jobId).emit("receiveMessage", message);

      /* CREATE NOTIFICATION */
      await Notification.create({
        user: data.receiverId,
        text: "New message received",
        type: "chat",
      });

      io.emit("notification");
    } catch (err) {
      console.log("Socket message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* ======================
   GLOBAL ERROR HANDLER
====================== */

app.use((err, req, res, next) => {
  console.log("SERVER ERROR:", err);
  res.status(500).json({ message: "Server error" });
});

/* ======================
   START SERVER
====================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
