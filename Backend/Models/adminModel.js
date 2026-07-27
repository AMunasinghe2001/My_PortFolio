const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },

        // ---- Password reset (OTP) ----
        // The OTP is stored hashed, never in plain text, so a leaked database
        // dump can't be used to complete a reset. `select: false` keeps these
        // out of ordinary queries.
        resetOtpHash: { type: String, select: false },
        resetOtpExpires: { type: Date, select: false },
        resetOtpAttempts: { type: Number, default: 0, select: false },
        // Issued once the OTP is verified; the reset step requires it, so the
        // new password can only be set by whoever proved they got the email.
        resetTokenHash: { type: String, select: false },
        resetTokenExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AdminModel", adminSchema);
