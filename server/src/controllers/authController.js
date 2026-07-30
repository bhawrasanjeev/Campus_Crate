const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const { JWT_SECRET } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

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

// @desc    Register a new user & send OTP code via Nodemailer
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        if (!checkDbConnected(res)) return;

        const { name, email, password, department, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password." });
        }

        const lowerEmail = email.toLowerCase();
        let user = await User.findOne({ email: lowerEmail });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        if (user) {
            user.name = name;
            user.password = password;
            user.department = department || user.department;
            user.otp = otpCode;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            user = await User.create({
                name,
                email: lowerEmail,
                password,
                department: department || "General Campus",
                role: role || "student",
                avatar: "/user-avatar.svg",
                isVerified: false,
                otp: otpCode,
                otpExpires
            });
        }

        console.log(`🔑 [NODEMAILER OTP CODE]: ${otpCode} for ${lowerEmail}`);

        // Dispatch Email with await to ensure proper tracking and diagnostic output
        const emailSent = await sendEmail({
            to: lowerEmail,
            subject: "CampusCrate - Your 6-Digit Verification OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #1e3a8a; text-align: center;">CampusCrate Account Verification</h2>
                    <p style="font-size: 15px; color: #475569;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 14px; color: #475569;">Use the following 6-digit OTP code to verify your CampusCrate account:</p>
                    <div style="text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; background-color: #eff6ff; padding: 10px 24px; border-radius: 8px; border: 1px solid #bfdbfe; display: inline-block;">
                            ${otpCode}
                        </span>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">This code will expire in 10 minutes. Please do not share this OTP with anyone.</p>
                </div>
            `
        }).catch(err => {
            console.error("SendEmail Async Error:", err.message);
            return null;
        });

        if (!emailSent) {
            console.warn(`⚠️ Warning: Failed to send OTP email to ${lowerEmail}. Check Render environment variables (EMAIL_USER & EMAIL_PASS).`);
        }

        res.status(200).json({
            message: "Registration successful. Please enter the 6-digit OTP sent to your email.",
            email: lowerEmail,
            requiresOtp: true,
            emailSent: !!emailSent,
            debugOtp: otpCode
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message || "Server Error during registration" });
    }
};

// @desc    Send fresh OTP code via Nodemailer
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    try {
        if (!checkDbConnected(res)) return;

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required to send OTP." });
        }

        const lowerEmail = email.toLowerCase();
        let user = await User.findOne({ email: lowerEmail });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email." });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otpCode;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        console.log(`🔑 [NODEMAILER OTP CODE]: ${otpCode} for ${lowerEmail}`);

        const emailSent = await sendEmail({
            to: lowerEmail,
            subject: "CampusCrate - Your OTP Security Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #1e3a8a; text-align: center;">Verification Code</h2>
                    <p style="font-size: 14px; color: #475569;">Your 6-digit verification code is:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; background-color: #eff6ff; padding: 10px 24px; border-radius: 8px;">
                            ${otpCode}
                        </span>
                    </div>
                </div>
            `
        }).catch(err => {
            console.error("SendEmail Async Error:", err.message);
            return null;
        });

        if (!emailSent) {
            console.warn(`⚠️ Warning: Failed to send OTP email to ${lowerEmail}. Check Render environment variables (EMAIL_USER & EMAIL_PASS).`);
        }

        res.json({
            message: "OTP sent successfully.",
            email: lowerEmail,
            emailSent: !!emailSent,
            debugOtp: otpCode
        });
    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({ message: error.message || "Server Error sending OTP" });
    }
};

// @desc    Verify OTP code and authenticate user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        if (!checkDbConnected(res)) return;

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Please provide both email and 6-digit OTP code." });
        }

        const lowerEmail = email.toLowerCase();
        const user = await User.findOne({ email: lowerEmail });

        if (!user) {
            return res.status(404).json({ message: "User account not found." });
        }

        const isValidOtp = user.otp && user.otp === String(otp).trim();

        if (!isValidOtp) {
            return res.status(400).json({ message: "Invalid OTP code. Please check your email and try again." });
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            return res.status(400).json({ message: "OTP code has expired. Please request a new OTP." });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            avatar: user.avatar || "/user-avatar.svg",
            isVerified: true,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: error.message || "Server Error verifying OTP" });
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
                avatar: user.avatar || "/user-avatar.svg",
                isVerified: user.isVerified || false,
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
        user.avatar = req.body.avatar || user.avatar || "/user-avatar.svg";

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
            isVerified: updatedUser.isVerified,
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

        const { email, name, avatar } = req.body;

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
                avatar: avatar || "/user-avatar.svg",
                department: "General Campus",
                role: "student",
                isVerified: true
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            avatar: user.avatar || "/user-avatar.svg",
            isVerified: true,
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
    sendOtp,
    verifyOtp,
    googleLogin,
    getMe,
    updateProfile
};
