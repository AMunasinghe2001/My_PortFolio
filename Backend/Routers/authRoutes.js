const express = require("express");
const router = express.Router();
const { login, me } = require("../Controllers/authController");
const verifyToken = require("../Middleware/authMiddleware");

router.post("/login", login);
router.get("/me", verifyToken, me);

module.exports = router;
