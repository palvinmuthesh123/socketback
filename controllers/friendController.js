const FriendRequest = require("../models/FriendRequest");
const User = require("../models/userModel");

// ✅ Send Friend Request
exports.sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (senderId === receiverId) {
    return res.status(400).json({ message: "You cannot send a request to yourself!" });
  }

  try {
    const existingRequest = await FriendRequest.findOne({ senderId, receiverId });
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent!" });
    }

    const friendRequest = new FriendRequest({ senderId, receiverId });
    await friendRequest.save();

    res.status(201).json({ message: "Friend request sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error sending request", error });
  }
};

// ✅ Accept Friend Request
exports.acceptFriendRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found!" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    res.status(200).json({ message: "Friend request accepted!" });
  } catch (error) {
    res.status(500).json({ message: "Error accepting request", error });
  }
};

// ✅ Get Friend Requests for a User
exports.getFriendRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await FriendRequest.find({ receiverId: userId, status: "pending" })
      .populate("senderId", "username email");

    console.log(requests, "RRRRRRRRRRRRR")

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error });
  }
};

// ✅ Get List of Friends
exports.getFriends = async (req, res) => {
  const { userId } = req.params;

  try {
    const friends = await FriendRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: "accepted",
    }).populate("senderId receiverId", "username email");

    const friendList = friends.map((req) =>
      req.senderId._id.toString() === userId ? req.receiverId : req.senderId
    );

    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friends", error });
  }
};

// ✅ Get List of Friends Status
exports.getFriendsStatus = async (req, res) => {
    const { userId } = req.params;
    try {
        const friendships = await FriendRequest.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
        .populate("senderId", "username")
        .populate("receiverId", "username");

        const friendStatuses = {};
        const pendingRequests = [];

        friendships.forEach((friendship) => {
            const senderId = friendship.senderId._id.toString();
            const receiverId = friendship.receiverId._id.toString();

            if (senderId === userId) {
                if (friendship.status === "pending") {
                    friendStatuses[receiverId] = "Pending";  // User sent request
                } else {
                    friendStatuses[receiverId] = "Friends";
                }
            } else if (receiverId === userId) {
                if (friendship.status === "pending") {
                    friendStatuses[senderId] = "Yet to Accept";  // User received request
                    pendingRequests.push({
                        _id: friendship._id,
                        senderId,
                        senderName: friendship.senderId.username,
                    });
                } else {
                    friendStatuses[senderId] = "Friends";
                }
            }
        });

        res.json({ friendStatuses, pendingRequests });
    } catch (err) {
        console.error("Error fetching friend statuses:", err);
        res.status(500).json({ error: err.message });
    }
};