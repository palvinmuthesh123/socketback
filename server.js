const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const User = require("./models/userModel");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const friendRoutes = require("./routes/friendRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/friends", friendRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

let onlineUsers = new Map(); // Store online users

// SOCKET.IO CONNECTION
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("login", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`User Logged In: ${userId}`);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });

  // Join private chat room
  socket.on("joinChat", ({ userId, chatUserId }) => {
    if (userId && chatUserId) {
      socket.join(userId); // Join user's personal room
      socket.join(chatUserId); // Join chat partner's room
    }
  });

  socket.on("sendFriendRequest", async ({ senderId, receiverId }) => {
      const sender = await User.findById(senderId); // Assuming you have a User model
      if (!sender) return;

      if (onlineUsers.has(receiverId)) {
          // Notify receiver about the new friend request
          io.to(onlineUsers.get(receiverId)).emit("friendRequestReceived", { senderId, senderName: sender.username });

          // 🔑 Notify sender about the updated status (Pending)
          io.to(onlineUsers.get(senderId)).emit("friendRequestSent", { receiverId });
      }
  });

  socket.on("acceptFriendRequest", ({ senderId, receiverId }) => {
    if (onlineUsers.has(senderId)) {
      io.to(onlineUsers.get(senderId)).emit("friendRequestAccepted", { receiverId });
    }
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    const sender = await User.findById(senderId);
    if (onlineUsers.has(receiverId)) {
      io.to(onlineUsers.get(receiverId)).emit("receiveMessage", { senderId, text, senderName: sender.username });
    }
  });

  socket.on("logout", (userId) => {
    if (userId && onlineUsers.has(userId)) {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log(`User Logged Out: ${userId}`);
    }
    socket.disconnect();
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log(`User Disconnected: ${userId}`);
        break;
      }
    }
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
