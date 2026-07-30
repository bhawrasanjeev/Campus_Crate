const express = require("express");
const router = express.Router();
const {
    accessConversation,
    getConversations,
    getMessages,
    sendMessage,
    sendGuestInquiry
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

// Public route for non-logged-in guest inquiries
router.post("/guest-inquiry", sendGuestInquiry);

router.use(protect);

router.route("/conversations").post(accessConversation).get(getConversations);
router.route("/messages/:conversationId").get(getMessages);
router.route("/messages").post(sendMessage);

module.exports = router;
