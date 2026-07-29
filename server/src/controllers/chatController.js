const Conversation = require("../models/conversation");
const Message = require("../models/message");

// @desc    Create or fetch a direct conversation with another user
// @route   POST /api/chat/conversations
// @access  Private
const accessConversation = async (req, res) => {
    try {
        const { targetUserId, itemId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ message: "Target user ID is required." });
        }

        if (targetUserId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot start a conversation with yourself." });
        }

        let isConversation = await Conversation.find({
            $and: [
                { participants: { $elemMatch: { $eq: req.user._id } } },
                { participants: { $elemMatch: { $eq: targetUserId } } }
            ]
        })
            .populate("participants", "-password")
            .populate("item");

        if (isConversation.length > 0) {
            res.json(isConversation[0]);
        } else {
            const chatData = {
                participants: [req.user._id, targetUserId],
                item: itemId || null,
                lastMessage: "Conversation started"
            };

            const createdChat = await Conversation.create(chatData);
            const fullChat = await Conversation.findOne({ _id: createdChat._id })
                .populate("participants", "-password")
                .populate("item");

            res.status(201).json(fullChat);
        }
    } catch (error) {
        console.error("Access Conversation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch all conversations for logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $elemMatch: { $eq: req.user._id } }
        })
            .populate("participants", "-password")
            .populate("item")
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error("Get Conversations Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all messages for a specific conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId })
            .populate("sender", "name email avatar")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a new message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { conversationId, text, attachments } = req.body;

        if (!conversationId || !text) {
            return res.status(400).json({ message: "Conversation ID and text are required." });
        }

        let newMessage = {
            conversationId,
            sender: req.user._id,
            text,
            attachments: attachments || []
        };

        let message = await Message.create(newMessage);
        message = await message.populate("sender", "name email avatar");
        message = await message.populate("conversationId");

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            lastMessageAt: Date.now()
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    accessConversation,
    getConversations,
    getMessages,
    sendMessage
};
