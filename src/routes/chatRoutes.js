const express = require("express");
const router = express.Router();
const {
    accessConversation,
    getConversations,
    getMessages,
    sendMessage
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/conversations").post(accessConversation).get(getConversations);
router.route("/messages/:conversationId").get(getMessages);
router.route("/messages").post(sendMessage);

module.exports = router;
