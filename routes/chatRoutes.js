const express = require("express");
const { sendMessage, getChatMessages } = require("../controllers/chatController");

const router = express.Router();

router.post("/send", sendMessage);
router.get("/:user1/:user2", getChatMessages);

module.exports = router;
