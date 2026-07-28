const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const itemRoutes = require("./routes/itemRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// API Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

// Healthcheck Route
app.get("/", (req, res) => {
    res.json({
        status: "Online",
        service: "CampusCrate Backend API",
        time: new Date().toISOString()
    });
});

// 404 Route Handler
app.use((req, res, next) => {
    res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
});

module.exports = app;