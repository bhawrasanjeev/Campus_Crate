const express = require("express");
const router = express.Router();
const { createReport, getReports, updateReportStatus, deleteReport } = require("../controllers/reportController");
const { protect, optionalProtect, adminOnly } = require("../middleware/auth");

router.post("/", optionalProtect, createReport);
router.get("/", protect, adminOnly, getReports);
router.put("/:id", protect, adminOnly, updateReportStatus);
router.delete("/:id", protect, adminOnly, deleteReport);

module.exports = router;