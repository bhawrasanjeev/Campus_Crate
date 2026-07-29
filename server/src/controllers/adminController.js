const Item = require("../models/items");
const Report = require("../models/report");
const User = require("../models/user");
const Claim = require("../models/claim");

// @desc    Get dashboard metrics & stats
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
const getDashboardStats = async (req, res) => {
    try {
        const totalItems = await Item.countDocuments({});
        const activeItems = await Item.countDocuments({ status: "active" });
        const claimedItems = await Item.countDocuments({ status: "claimed" });
        
        const totalClaims = await Claim.countDocuments({});
        const pendingClaims = await Claim.countDocuments({ status: "Pending" });
        const approvedClaims = await Claim.countDocuments({ status: "Approved" });

        const totalReports = await Report.countDocuments({});
        const pendingReports = await Report.countDocuments({ status: "pending" });

        const totalUsers = await User.countDocuments({});
        const studentUsers = await User.countDocuments({ role: "student" });
        const adminUsers = await User.countDocuments({ role: "admin" });

        res.json({
            items: {
                total: totalItems,
                active: activeItems,
                claimed: claimedItems
            },
            claims: {
                total: totalClaims,
                pending: pendingClaims,
                approved: approvedClaims
            },
            reports: {
                total: totalReports,
                pending: pendingReports
            },
            users: {
                total: totalUsers,
                students: studentUsers,
                admins: adminUsers
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server Error fetching dashboard stats" });
    }
};

// @desc    Submit a claim for an item
// @route   POST /api/admin/claims
// @access  Private (Authenticated Users)
const createClaim = async (req, res) => {
    try {
        const { itemId, itemTitle, itemImage, location, verificationAnswer, message } = req.body;

        if (!itemId || !verificationAnswer) {
            return res.status(400).json({ message: "Item ID and verification answer are required." });
        }

        const claim = await Claim.create({
            itemId,
            itemTitle: itemTitle || "Claimed Item",
            itemImage: itemImage || "",
            location: location || "Campus",
            claimant: req.user._id,
            verificationAnswer,
            message: message || "",
            status: "Pending"
        });

        const populatedClaim = await Claim.findById(claim._id)
            .populate("claimant", "name email role department avatar studentId")
            .populate("itemId", "title location type status");

        res.status(201).json(populatedClaim);
    } catch (error) {
        console.error("Create Claim Error:", error);
        res.status(500).json({ message: "Server Error submitting claim" });
    }
};

// @desc    Get all claims
// @route   GET /api/admin/claims
// @access  Private (Admin Only)
const getClaims = async (req, res) => {
    try {
        const claims = await Claim.find({})
            .populate("claimant", "name email role department avatar studentId")
            .populate("itemId", "title location type status")
            .sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        console.error("Get Claims Error:", error);
        res.status(500).json({ message: "Server Error fetching claims" });
    }
};

// @desc    Update claim status
// @route   PUT /api/admin/claims/:id
// @access  Private (Admin Only)
const updateClaim = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !["Pending", "Approved", "Needs Info"].includes(status)) {
            return res.status(400).json({ message: "Invalid claim status value." });
        }

        let claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ message: "Claim not found." });
        }

        claim.status = status;
        await claim.save();

        // If approved, update the item's status to "claimed"
        if (status === "Approved") {
            await Item.findByIdAndUpdate(claim.itemId, { status: "claimed" });
        }

        const updatedClaim = await Claim.findById(claim._id)
            .populate("claimant", "name email role department avatar studentId")
            .populate("itemId", "title location type status");

        res.json(updatedClaim);
    } catch (error) {
        console.error("Update Claim Error:", error);
        res.status(500).json({ message: "Server Error updating claim" });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Server Error fetching users" });
    }
};

// @desc    Block or unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin Only)
const toggleUserBlock = async (req, res) => {
    try {
        const { blocked } = req.body;

        if (typeof blocked !== "boolean") {
            return res.status(400).json({ message: "Blocked must be a boolean." });
        }

        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.role === "admin") {
            return res.status(400).json({ message: "Cannot block administrator accounts." });
        }

        user.blocked = blocked;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            blocked: user.blocked
        });
    } catch (error) {
        console.error("Toggle Block Error:", error);
        res.status(500).json({ message: "Server Error toggling user block status" });
    }
};

module.exports = {
    getDashboardStats,
    createClaim,
    getClaims,
    updateClaim,
    getUsers,
    toggleUserBlock
};
