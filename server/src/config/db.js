const mongoose = require("mongoose");

const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const localUri = "mongodb://127.0.0.1:27017/Campus_Crate";

    try {
        if (!primaryUri) {
            console.warn(" MONGODB_URI not set. Attempting local MongoDB connection...");
            const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
            console.log(` Local MongoDB Connected: ${conn.connection.host}`);
            return;
        }

        console.log("⏳ Connecting to MongoDB...");
        const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (primaryErr) {
        console.error(`❌ Primary MongoDB Error (${primaryErr.message}). Trying local fallback...`);
        try {
            const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
            console.log(`✅ Local MongoDB Fallback Connected: ${conn.connection.host}`);
        } catch (localErr) {
            console.error(`❌ Local MongoDB also unavailable: ${localErr.message}`);
            console.warn("⚠️ Server running in Database-Disconnected mode. Set up a valid MONGODB_URI in server/.env");
        }
    }
};

module.exports = connectDB;