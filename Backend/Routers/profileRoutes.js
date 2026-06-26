const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../Controllers/profileController");
const verifyToken = require("../Middleware/authMiddleware");
const upload = require("../Middleware/upload");

router.get("/", getProfile);
router.put(
    "/",
    verifyToken,
    upload.fields([
        { name: "heroImage", maxCount: 1 },
        { name: "aboutImage", maxCount: 1 },
        { name: "resume", maxCount: 1 },
    ]),
    updateProfile
);

module.exports = router;
