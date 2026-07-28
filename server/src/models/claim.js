const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        itemTitle: {
            type: String,
            required: true
        },
        itemImage: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            required: true
        },
        claimant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        verificationAnswer: {
            type: String,
            required: true
        },
        message: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Needs Info"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Claim", claimSchema);
