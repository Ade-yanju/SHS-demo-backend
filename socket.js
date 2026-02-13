import { Server } from "socket.io";
import Message from "./models/Message.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN JOB ROOM
    socket.on("joinRoom", (jobId) => {
      socket.join(jobId);
      console.log("Joined room:", jobId);
    });

    // SEND MESSAGE
    socket.on("sendMessage", async (data) => {
      try {
        const message = await Message.create(data);

        // send to everyone in the job chat
        io.to(data.jobId).emit("receiveMessage", message);
      } catch (err) {
        console.log("Message error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};
