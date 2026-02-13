import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: String,
  jobId: String,
  senderId: String,
  receiverId: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
