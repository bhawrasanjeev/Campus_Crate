const Conversation = require("../models/conversation");
const Message = require("../models/message");
const Item = require("../models/items");
const sendEmail = require("../utils/sendEmail");

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

// @desc    Send guest inquiry message to item owner via Email
// @route   POST /api/chat/guest-inquiry
// @access  Public
const sendGuestInquiry = async (req, res) => {
    try {
        const { itemId, guestName, guestEmail, message } = req.body;
        if (!itemId || !message || !guestEmail) {
            return res.status(400).json({ message: "Item ID, guest email, and message content are required." });
        }

        const item = await Item.findById(itemId).populate("postedBy", "name email");
        if (!item) {
            return res.status(404).json({ message: "Target item not found." });
        }

        const ownerEmail = item.postedBy?.email;
        if (ownerEmail) {
            await sendEmail({
                to: ownerEmail,
                subject: `CampusCrate Guest Inquiry: ${item.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h3 style="color: #1e3a8a;">New Guest Inquiry for your listing "${item.title}"</h3>
                        <p><strong>From Guest:</strong> ${guestName || "Campus Visitor"} (&lt;${guestEmail}&gt;)</p>
                        <p><strong>Message:</strong></p>
                        <blockquote style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #3b82f6; border-radius: 4px;">
                            ${message}
                        </blockquote>
                        <p style="font-size: 12px; color: #64748b;">You can reply directly to the guest at <strong>${guestEmail}</strong>.</p>
                    </div>
                `
            }).catch(err => console.error("Guest Inquiry Email Error:", err.message));
        }

        res.status(200).json({
            message: "Your inquiry message has been delivered to the item owner successfully!"
        });
    } catch (error) {
        console.error("Guest Inquiry Error:", error);
        res.status(500).json({ message: "Server Error sending guest inquiry." });
    }
};

module.exports = {
    accessConversation,
    getConversations,
    getMessages,
    sendMessage,
    sendGuestInquiry
};
