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

module.exports = { login, me };
