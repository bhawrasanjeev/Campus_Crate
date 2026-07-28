const Report = require("../models/Report");
const Item = require("../models/Item");

const createReport = async (req, res) => {
    try {
        const { itemId, reason } = req.body;

        if (!itemId || !reason) {
            return res.status(400).json({ message: "Please provide item ID and reason." });
        }

        const itemExists = await Item.findById(itemId);
        if (!itemExists) {
            return res.status(404).json({ message: "Target item not found." });
        }

        const report = await Report.create({
            item: itemId,
            reportedBy: req.user._id,
            reason
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .populate("item", "title type category location")
            .populate("reportedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        report.status = status || report.status;
        const updatedReport = await report.save();

        res.status(200).json(updatedReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReport,
    getReports,
    updateReportStatus
};