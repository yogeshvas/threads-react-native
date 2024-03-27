import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  joindDate: { type: Date, default: Date.now },
  sentFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  receivedFollowRequests: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
});

export const User = mongoose.model("User", userSchema);
