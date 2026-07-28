const Item = require("../models/Item");
const { findMatchesForItem } = require("../services/matchService");

const createItem = async (req, res) => {
    try {
        const { type, title, description, category, location, date, photoUrl, tags } = req.body;

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
            tags: tags || [],
            postedBy: req.user._id
        });

        const matches = await findMatchesForItem(item);

        const populatedItem = await Item.findById(item._id).populate("postedBy", "name email avatar");
        
        res.status(201).json({
            item: populatedItem,
            matches
        });
    } catch (error) {
        console.error("Create Item Error:", error);
        res.status(500).json({ message: "Server Error creating item" });
    }
};

const getItems = async (req, res) => {
    try {
        const { type, category, search } = req.query;
        let query = { status: "active" };

        if (type) query.type = type;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ];
        }

        const items = await Item.find(query).populate("postedBy", "name email avatar").sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        console.error("Get Items Error:", error);
        res.status(500).json({ message: "Server Error fetching items" });
    }
};

const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate("postedBy", "name email avatar");
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(item);
    } catch (error) {
        console.error("Get Item Error:", error);
        res.status(500).json({ message: "Server Error fetching item" });
    }
};

const updateItem = async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to update this item" });
        }

        item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(item);
    } catch (error) {
        console.error("Update Item Error:", error);
        res.status(500).json({ message: "Server Error updating item" });
    }
};

const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this item" });
        }

        await item.deleteOne();
        res.status(200).json({ message: "Item removed successfully" });
    } catch (error) {
        console.error("Delete Item Error:", error);
        res.status(500).json({ message: "Server Error deleting item" });
    }
};

module.exports = {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem
};