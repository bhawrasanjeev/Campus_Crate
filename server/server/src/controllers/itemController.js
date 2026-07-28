const Item = require("../models/items");
const mongoose = require("mongoose");

// @desc    Get all active lost/found items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
    try {
        const { type, category, status } = req.query;
        let query = {};
        
        if (type) query.type = type;
        if (category && category !== "All Categories") query.category = category;
        if (status) query.status = status;
        
        const items = await Item.find(query).populate("postedBy", "name email avatar").sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error("Get Items Error:", error);
        res.status(500).json({ message: "Server Error fetching items" });
    }
};

// @desc    Get single item details
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate("postedBy", "name email avatar");
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json(item);
    } catch (error) {
        console.error("Get Item Error:", error);
        res.status(500).json({ message: "Server Error fetching item details" });
    }
};

// @desc    Create new item post
// @route   POST /api/items
// @access  Private (Authenticated Users)
const createItem = async (req, res) => {
    try {
        const { type, title, description, category, location, date, photoUrl, claimQuestion, tags } = req.body;

        if (!type || !title || !description || !category || !location || !date) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const item = await Item.create({
            type,
            title,
            description,
            category,
            location,
            date,
            photoUrl: photoUrl || "",
            claimQuestion: claimQuestion || "",
            tags: tags || [],
            postedBy: req.user._id
        });

        const populatedItem = await Item.findById(item._id).populate("postedBy", "name email avatar");
        res.status(201).json(populatedItem);
    } catch (error) {
        console.error("Create Item Error:", error);
        res.status(500).json({ message: "Server Error creating item" });
    }
};

// @desc    Update item status or details
// @route   PUT /api/items/:id
// @access  Private (Owner or Admin)
const updateItem = async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Authorize: Owner of post or Admin
        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(401).json({ message: "Not authorized to update this item" });
        }

        item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("postedBy", "name email avatar");
        res.json(item);
    } catch (error) {
        console.error("Update Item Error:", error);
        res.status(500).json({ message: "Server Error updating item" });
    }
};

module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem
};
