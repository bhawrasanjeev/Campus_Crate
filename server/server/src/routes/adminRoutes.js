const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    getClaims,
    updateClaim,
    getUsers,
    toggleUserBlock
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

// Apply protection to all admin routes
router.use(protect);
router.use(adminOnly);

router.get("/stats", getDashboardStats);

router.route("/claims")
    .get(getClaims);

router.route("/claims/:id")
    .put(updateClaim);

router.route("/users")
    .get(getUsers);

router.route("/users/:id/block")
    .put(toggleUserBlock);

module.exports = router;
