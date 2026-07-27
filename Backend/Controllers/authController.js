const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Admin = require("../Models/adminModel");
const { sendOtpEmail, isMailConfigured } = require("../config/mailer");

// ---- Password reset settings ----
const OTP_TTL_MINUTES = 10;
const RESET_TOKEN_TTL_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;

// Where reset codes are sent. This is a single-admin site, so the address is
// fixed server-side rather than taken from the request — otherwise anyone
// could redirect a reset code to an address they control.
const RESET_EMAIL = process.env.RESET_EMAIL || process.env.SMTP_USER;

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

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

// Masks an address for display: a***a@gmail.com. Confirms to the real owner
// which inbox to check without disclosing the full address to a stranger.
const maskEmail = (email) => {
    const [name, domain] = String(email).split("@");
    if (!domain) return "your email";
    const head = name.slice(0, 1);
    const tail = name.length > 1 ? name.slice(-1) : "";
    return `${head}${"*".repeat(Math.max(1, name.length - 2))}${tail}@${domain}`;
};

// POST /auth/forgot-password — emails a one-time code.
const forgotPassword = async (req, res) => {
    if (!isMailConfigured() || !RESET_EMAIL) {
        return res.status(503).json({
            message:
                "Password reset email is not configured on the server. Set SMTP_USER and SMTP_PASS.",
        });
    }

    try {
        const admin = await Admin.findOne().select(
            "+resetOtpHash +resetOtpExpires +resetOtpAttempts"
        );
        if (!admin) {
            return res.status(404).json({ message: "No admin account exists yet" });
        }

        // 6-digit code from a cryptographically secure source.
        const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

        admin.resetOtpHash = sha256(code);
        admin.resetOtpExpires = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
        admin.resetOtpAttempts = 0;
        // Starting a new request invalidates any previously verified session.
        admin.resetTokenHash = undefined;
        admin.resetTokenExpires = undefined;
        await admin.save();

        await sendOtpEmail(RESET_EMAIL, code, OTP_TTL_MINUTES);

        return res.status(200).json({
            message: `We sent a 6-digit code to ${maskEmail(RESET_EMAIL)}.`,
            email: maskEmail(RESET_EMAIL),
            expiresInMinutes: OTP_TTL_MINUTES,
        });
    } catch (err) {
        console.log(err);
        // Gmail rejecting the credentials is by far the most common failure and
        // is entirely fixable by the admin, so say so instead of a generic
        // "could not send" that gives them nothing to act on.
        if (err.code === "EAUTH") {
            return res.status(502).json({
                message:
                    "The email account rejected the login. Generate a fresh Google App Password and update SMTP_PASS, then restart the server.",
            });
        }
        if (err.code === "ECONNECTION" || err.code === "ETIMEDOUT") {
            return res.status(502).json({
                message: "Could not reach the mail server. Check the server's internet connection.",
            });
        }
        return res.status(500).json({ message: "Could not send the reset code" });
    }
};

// POST /auth/verify-otp — exchanges a valid code for a short-lived reset token.
const verifyOtp = async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ message: "Enter the 6-digit code" });
    }

    try {
        const admin = await Admin.findOne().select(
            "+resetOtpHash +resetOtpExpires +resetOtpAttempts"
        );
        if (!admin || !admin.resetOtpHash) {
            return res
                .status(400)
                .json({ message: "Request a new code — this one is no longer valid" });
        }

        if (!admin.resetOtpExpires || admin.resetOtpExpires < new Date()) {
            admin.resetOtpHash = undefined;
            admin.resetOtpExpires = undefined;
            await admin.save();
            return res.status(400).json({ message: "That code expired. Request a new one." });
        }

        // Throttle guessing: 6 digits is only a million combinations.
        if (admin.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
            admin.resetOtpHash = undefined;
            admin.resetOtpExpires = undefined;
            await admin.save();
            return res
                .status(429)
                .json({ message: "Too many incorrect attempts. Request a new code." });
        }

        const supplied = sha256(String(code).trim());
        const stored = admin.resetOtpHash;
        const matches =
            supplied.length === stored.length &&
            crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(stored));

        if (!matches) {
            admin.resetOtpAttempts += 1;
            await admin.save();
            const left = MAX_OTP_ATTEMPTS - admin.resetOtpAttempts;
            return res.status(401).json({
                message:
                    left > 0
                        ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.`
                        : "Incorrect code. Request a new one.",
            });
        }

        // Correct: burn the OTP and issue a one-use reset token.
        const resetToken = crypto.randomBytes(32).toString("hex");
        admin.resetOtpHash = undefined;
        admin.resetOtpExpires = undefined;
        admin.resetOtpAttempts = 0;
        admin.resetTokenHash = sha256(resetToken);
        admin.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000);
        await admin.save();

        return res.status(200).json({ resetToken, username: admin.username });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Could not verify the code" });
    }
};

// POST /auth/reset-password — sets the new password using the reset token.
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "Reset token and new password are required" });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    try {
        const admin = await Admin.findOne().select("+resetTokenHash +resetTokenExpires");
        if (!admin || !admin.resetTokenHash) {
            return res.status(400).json({ message: "Start again — this reset is no longer valid" });
        }
        if (!admin.resetTokenExpires || admin.resetTokenExpires < new Date()) {
            admin.resetTokenHash = undefined;
            admin.resetTokenExpires = undefined;
            await admin.save();
            return res.status(400).json({ message: "This reset expired. Start again." });
        }

        const supplied = sha256(String(resetToken));
        const stored = admin.resetTokenHash;
        const matches =
            supplied.length === stored.length &&
            crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(stored));
        if (!matches) {
            return res.status(401).json({ message: "Invalid reset token" });
        }

        admin.passwordHash = await bcrypt.hash(newPassword, 10);
        admin.resetTokenHash = undefined;
        admin.resetTokenExpires = undefined;
        await admin.save();

        // Log them straight in so they don't have to retype the new password.
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).json({
            token,
            username: admin.username,
            message: "Password updated successfully",
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Could not reset the password" });
    }
};

module.exports = {
    login,
    me,
    updateCredentials,
    forgotPassword,
    verifyOtp,
    resetPassword,
};
