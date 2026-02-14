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
import Request from "./models/Request.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: ["http://localhost:5173", "https://shs-demo-ten.vercel.app/"],
    credentials: true,
  }),
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ================= DATABASE ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB ERROR:", err));

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

/* =====================================================
   REALTIME CHAT SYSTEM (FINAL ARCHITECTURE)
===================================================== */

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* JOIN PRIVATE ROOM */
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log("Joined room:", roomId);
  });

  /* SEND MESSAGE */
  socket.on("sendMessage", async (data) => {
    try {
      const { roomId, jobId, senderId, receiverId, text } = data;

      if (!roomId || !jobId || !senderId || !receiverId || !text) return;

      const message = await Message.create({
        roomId,
        jobId,
        senderId,
        receiverId,
        text,
      });

      /* Emit only to this private room */
      io.to(roomId).emit("receiveMessage", message);

      /* Optional notification */
      io.to(`user:${receiverId}`).emit("notification", {
        type: "chat",
        jobId,
      });
    } catch (err) {
      console.log("Socket message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ================= GLOBAL ERROR ================= */

app.use((err, req, res, next) => {
  console.log("SERVER ERROR:", err);
  res.status(500).json({ message: "Server error" });
});

/* ================= START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
