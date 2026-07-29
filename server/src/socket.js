const socketIO = require("socket.io");

const initSocket = (server) => {
    const io = socketIO(server, {
        pingTimeout: 60000,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("⚡ Real-time Socket connected:", socket.id);

        socket.on("setup", (userData) => {
            if (userData && userData._id) {
                socket.join(userData._id);
                socket.emit("connected");
                console.log(`User socket joined personal room: ${userData._id}`);
            }
        });

        socket.on("join_chat", (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined chat room: ${room}`);
        });

        socket.on("typing", (room) => socket.in(room).emit("typing", room));
        socket.on("stop_typing", (room) => socket.in(room).emit("stop_typing", room));

        socket.on("new_message", (newMessageReceived) => {
            const conversation = newMessageReceived.conversationId;

            if (!conversation) return console.log("conversationId not defined on socket message");

            // If conversation room exists, broadcast to that room
            const room = typeof conversation === 'object' ? conversation._id : conversation;
            socket.in(room).emit("message_received", newMessageReceived);
        });

        socket.off("setup", (userData) => {
            if (userData && userData._id) {
                socket.leave(userData._id);
            }
        });

        socket.on("disconnect", () => {
            console.log("⚡ Real-time Socket disconnected:", socket.id);
        });
    });

    return io;
};

module.exports = initSocket;
