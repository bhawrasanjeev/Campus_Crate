const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const initSocket = require("./src/socket");

// Connect to MongoDB Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io for Real-time Chat
initSocket(server);

const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || "127.0.0.1";

server.listen(PORT, HOST, () => {
    console.log(`🚀 CampusCrate Server running on http://${HOST}:${PORT}`);
});
