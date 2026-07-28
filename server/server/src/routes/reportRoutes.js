const express = require("express");
const router = express.Router();
const {
    createReport,
    getReports,
    updateReportStatus
} = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/auth");

router.route("/")
    .post(protect, createReport)
    .get(protect, adminOnly, getReports);

router.route("/:id")
    .put(protect, adminOnly, updateReportStatus);

module.exports = router;
