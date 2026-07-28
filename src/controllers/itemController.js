const Item = require("../models/Item");

const createItem = async (req, res) => {
  try {
    const { type, title, description, category, location, date, tags } = req.body;

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
      tags,
      postedBy: req.user._id, 
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Create Item Error:", error);
    res.status(500).json({ message: error.message || "Server Error creating item" });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await Item.find({ status: "active" })
      .sort({ createdAt: -1 })
      .populate("postedBy", "name avatar department");

    res.status(200).json(items);
  } catch (error) {
    console.error("Get Items Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("postedBy", "name avatar department");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Get Single Item Error:", error);
    res.status(500).json({ message: "Server Error fetching item" });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } 
    );

    res.status(200).json(updatedItem);
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

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await item.deleteOne();

    res.status(200).json({ message: "Item successfully deleted" });
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