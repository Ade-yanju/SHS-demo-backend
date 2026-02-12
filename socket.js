import { Server } from "socket.io";
import Notification from "./models/Notification.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Admin connected");

    socket.on("newNotification", async (data) => {
      const notification = await Notification.create(data);
      io.emit("receiveNotification", notification);
    });
  });

  return io;
};
