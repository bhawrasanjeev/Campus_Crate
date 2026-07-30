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

        // Real-time Item Broadcasting across all online clients
        socket.on("new_item_posted", (newItem) => {
            console.log("⚡ Broadcasting new item to all clients:", newItem?.title);
            socket.broadcast.emit("item_added", newItem);
        });

        socket.on("item_claimed_event", (claimedItemId) => {
            console.log("⚡ Broadcasting item claimed to all clients:", claimedItemId);
            socket.broadcast.emit("item_claimed", claimedItemId);
        });

        socket.on("item_deleted_event", (deletedItemId) => {
            console.log("⚡ Broadcasting item deleted to all clients:", deletedItemId);
            socket.broadcast.emit("item_deleted", deletedItemId);
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
