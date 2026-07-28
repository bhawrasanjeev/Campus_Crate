const Report = require("../models/report");
const Item = require("../models/items");

// @desc    File a new safety/flag report for an item
// @route   POST /api/reports
// @access  Private (Authenticated Users)
const createReport = async (req, res) => {
    try {
        const { itemId, reason } = req.body;

        if (!itemId || !reason) {
            return res.status(400).json({ message: "Please provide item ID and reason for reporting." });
        }

        const itemExists = await Item.findById(itemId);
        if (!itemExists) {
            return res.status(404).json({ message: "Item not found." });
        }

        const report = await Report.create({
            reporter: req.user._id,
            item: itemId,
            reason
        });

        const populatedReport = await Report.findById(report._id)
            .populate("reporter", "name email role")
            .populate("item", "title location type status");

        res.status(201).json(populatedReport);
    } catch (error) {
        console.error("Create Report Error:", error);
        res.status(500).json({ message: "Server Error filing report" });
    }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Admin Only)
const getReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .populate("reporter", "name email role department")
            .populate({
                path: "item",
                populate: {
                    path: "postedBy",
                    select: "name email avatar"
                }
            })
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error("Get Reports Error:", error);
        res.status(500).json({ message: "Server Error fetching reports" });
    }
};

// @desc    Resolve/Dismiss a safety report
// @route   PUT /api/reports/:id
// @access  Private (Admin Only)
const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !["pending", "resolved", "dismissed"].includes(status)) {
            return res.status(400).json({ message: "Invalid report status value." });
        }

        let report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        report.status = status;
        await report.save();

        const updatedReport = await Report.findById(report._id)
            .populate("reporter", "name email role")
            .populate({
                path: "item",
                populate: {
                    path: "postedBy",
                    select: "name email avatar"
                }
            });

        res.json(updatedReport);
    } catch (error) {
        console.error("Update Report Error:", error);
        res.status(500).json({ message: "Server Error updating report status" });
    }
};

module.exports = {
    createReport,
    getReports,
    updateReportStatus
};
