const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../Models/adminModel");

// POST /auth/login
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const match = await bcrypt.compare(password, admin.passwordHash);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).json({ token, username: admin.username });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Login failed" });
    }
};

// GET /auth/me  (token required)
const me = async (req, res) => {
    return res.status(200).json({ admin: req.admin });
};

// PUT /auth/credentials  (token required) — change username and/or password
const updateCredentials = async (req, res) => {
    const { currentPassword, newUsername, newPassword } = req.body;
    if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
    }
    if (!newUsername && !newPassword) {
        return res.status(400).json({ message: "Provide a new username or a new password" });
    }
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const match = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!match) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const wantedUsername = (newUsername || "").trim();
        if (wantedUsername && wantedUsername !== admin.username) {
            const taken = await Admin.findOne({ username: wantedUsername });
            if (taken) {
                return res.status(409).json({ message: "That username is already taken" });
            }
            admin.username = wantedUsername;
        }
        if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters" });
            }
            admin.passwordHash = await bcrypt.hash(newPassword, 10);
        }
        await admin.save();

        // Re-issue a token (the username embedded in it may have changed).
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).json({
            token,
            username: admin.username,
            message: "Credentials updated successfully",
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to update credentials" });
    }
};

module.exports = { login, me, updateCredentials };
