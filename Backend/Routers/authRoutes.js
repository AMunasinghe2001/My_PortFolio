const express = require("express");
const router = express.Router();
const {
    login,
    me,
    updateCredentials,
    forgotPassword,
    verifyOtp,
    resetPassword,
} = require("../Controllers/authController");
const verifyToken = require("../Middleware/authMiddleware");

router.post("/login", login);
router.get("/me", verifyToken, me);
router.put("/credentials", verifyToken, updateCredentials);

// Password reset by emailed OTP. Public by necessity — these are the routes
// used precisely when the admin cannot log in.
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
