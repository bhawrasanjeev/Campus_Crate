const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const { JWT_SECRET } = require("../middleware/auth");

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: "30d"
    });
};

const checkDbConnected = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            message: "Database connection unavailable. Please check your MONGODB_URI in server/.env or ensure MongoDB is running."
        });
        return false;
    }
    return true;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        if (!checkDbConnected(res)) return;

        const { name, email, password, department, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password." });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            department: department || "General Campus",
            role: role || "student"
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message || "Server Error during registration" });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        if (!checkDbConnected(res)) return;

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter email and password." });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (user && (await user.matchPassword(password))) {
            if (user.blocked) {
                return res.status(403).json({ message: "Account has been suspended by administration." });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message || "Server Error during login" });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        if (!checkDbConnected(res)) return;

        const user = await User.findById(req.user._id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        if (!checkDbConnected(res)) return;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.department = req.body.department || user.department;
        user.phone = req.body.phone || user.phone;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            avatar: updatedUser.avatar,
            phone: updatedUser.phone,
            token: generateToken(updatedUser._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google OAuth login or register
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    try {
        if (!checkDbConnected(res)) return;

        const { email, name, avatar, googleId } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required for Google OAuth." });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            if (user.blocked) {
                return res.status(403).json({ message: "Account has been suspended by administration." });
            }

            if (avatar && !user.avatar) {
                user.avatar = avatar;
                await user.save();
            }
        } else {
            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            user = await User.create({
                name: name || email.split("@")[0],
                email: email.toLowerCase(),
                password: randomPassword,
                avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                department: "General Campus",
                role: "student"
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: error.message || "Google Authentication failed." });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    updateProfile
};
