import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  role: {
    type: String,
    enum: ["admin", "hirer", "freelancer"],
    default: "hirer"
  },

  approved: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("User", userSchema);
