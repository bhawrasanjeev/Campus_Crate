const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const initSocket = require("./socket");

// Connect to MongoDB Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io for Real-time Chat
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 CampusCrate Server running on port ${PORT}`);
});
