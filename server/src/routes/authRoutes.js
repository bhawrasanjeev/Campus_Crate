const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    sendOtp,
    verifyOtp,
    googleLogin,
    getMe,
    updateProfile
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;
