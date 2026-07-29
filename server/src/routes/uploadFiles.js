const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadToImageKit, imagekit } = require("../config/imagekit");

// @desc    Upload image to ImageKit Cloud or return data URL
// @route   POST /api/upload
// @access  Private
router.post("/", protect, async (req, res) => {
    try {
        const { image, fileName } = req.body;

        if (!image) {
            return res.status(400).json({ message: "No image payload provided" });
        }

        if (imagekit) {
            const hostedUrl = await uploadToImageKit(image, fileName || `item_${Date.now()}.jpg`);
            return res.status(200).json({
                message: "Image uploaded successfully to ImageKit Cloud",
                photoUrl: hostedUrl
            });
        }

        // Fallback: return image payload directly
        res.status(200).json({
            message: "Image processed successfully",
            photoUrl: image
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: error.message || "Failed to process image upload" });
    }
});

module.exports = router;