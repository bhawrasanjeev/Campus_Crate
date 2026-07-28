const express = require("express");
const router = express.Router();
const {
    getItems,
    getItemById,
    createItem,
    updateItem
} = require("../controllers/itemController");
const { protect } = require("../middleware/auth");

router.route("/")
    .get(getItems)
    .post(protect, createItem);

router.route("/:id")
    .get(getItemById)
    .put(protect, updateItem);

module.exports = router;
