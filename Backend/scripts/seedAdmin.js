require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../Models/adminModel");

(async () => {
    try {
        await connectDB();

        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;
        if (!username || !password) {
            throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env");
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await Admin.findOneAndUpdate(
            { username },
            { username, passwordHash },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`✅ Admin "${username}" is ready. You can log in with the password from .env.`);
    } catch (err) {
        console.error("❌ seed:admin failed:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
})();
