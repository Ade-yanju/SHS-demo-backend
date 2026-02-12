import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  message: String,
  type: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", NotificationSchema);
