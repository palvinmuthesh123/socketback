const Message = require("../models/messageModel");

// Send message
exports.sendMessage = async (req, res) => {
  const { sender, receiver, text } = req.body;

  try {
    const message = new Message({ sender, receiver, text });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
};

// Get chat messages between two users
exports.getChatMessages = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort("createdAt");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};
