const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/user");

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error("❌ MONGODB_URI is missing in .env");
            process.exit(1);
        }

        console.log("⏳ Connecting to MongoDB Atlas...");
        await mongoose.connect(mongoUri);
        console.log("✅ MongoDB Atlas Connected.");

        const adminCredentials = [
            {
                name: "shanu admin",
                email: "shanuadmin@gmail.com",
                password: "adminpassword123",
                department: "Campus Administration & Safety",
                role: "admin",
                isVerified: true
            },
            {
                name: "shanu admin",
                email: "shanuadmin@college.edu",
                password: "adminpassword123",
                department: "Campus Administration & Safety",
                role: "admin",
                isVerified: true
            }
        ];

        for (const creds of adminCredentials) {
            let user = await User.findOne({ email: creds.email });
            if (user) {
                user.name = creds.name;
                user.role = "admin";
                user.isVerified = true;
                user.password = creds.password; // Will be re-hashed by pre-save hook
                await user.save();
                console.log(`✅ Updated existing account (${creds.email}) to Admin for "${creds.name}".`);
            } else {
                await User.create(creds);
                console.log(`✅ Successfully created new Admin account (${creds.email}) for "${creds.name}".`);
            }
        }

        console.log("\n🎉 Admin setup complete!");
        console.log("-----------------------------------------");
        console.log("🔑 Email:    shanuadmin@gmail.com (or shanuadmin@college.edu)");
        console.log("🔑 Password: adminpassword123");
        console.log("🔑 Role:     admin");
        console.log("-----------------------------------------\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding Admin account:", error);
        process.exit(1);
    }
};

seedAdmin();
