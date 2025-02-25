const express = require("express");
const {
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  getFriendsStatus
} = require("../controllers/friendController");

const router = express.Router();

router.post("/send", sendFriendRequest);
router.post("/accept/:requestId", acceptFriendRequest);
router.get("/requests/:userId", getFriendRequests);
router.get("/friends/:userId", getFriends);
router.get("/status/:userId", getFriendsStatus);

module.exports = router;
