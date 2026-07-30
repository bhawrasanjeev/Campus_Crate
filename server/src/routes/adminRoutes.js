const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    createClaim,
    getClaims,
    updateClaim,
    getUsers,
    toggleUserBlock,
    deleteItemByAdmin,
    deleteUserByAdmin
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");


router.use(protect);

// Claim creation for authenticated students/users
router.route("/claims").post(createClaim);

// Admin-only endpoints
router.use(adminOnly);

router.get("/stats", getDashboardStats);

router.route("/claims").get(getClaims);
router.route("/claims/:id").put(updateClaim);

router.route("/users").get(getUsers);
router.route("/users/:id").delete(deleteUserByAdmin);
router.route("/users/:id/block").put(toggleUserBlock);

router.route("/items/:id").delete(deleteItemByAdmin);

module.exports = router;
