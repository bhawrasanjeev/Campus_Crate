const express = require("express");
const router = express.Router();
const { 
  createItem, 
  getItems, 
  getItemById, 
  updateItem, 
  deleteItem 
} = require("../controllers/itemController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createItem);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

module.exports = router;