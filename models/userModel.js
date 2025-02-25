const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  // email: { type: String, unique: true, required: true }, // Optional but useful
  password: { type: String, required: true },
  online: { type: Boolean, default: false }, // Tracks user online status
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of friends
  friendRequests: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "accepted"], default: "pending" },
    },
  ],
}, { timestamps: true }); // Adds createdAt & updatedAt timestamps

module.exports = mongoose.model("User", UserSchema);
