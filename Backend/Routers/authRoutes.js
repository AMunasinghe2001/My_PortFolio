const express = require("express");
const router = express.Router();
const { login, me, updateCredentials } = require("../Controllers/authController");
const verifyToken = require("../Middleware/authMiddleware");

router.post("/login", login);
router.get("/me", verifyToken, me);
router.put("/credentials", verifyToken, updateCredentials);

module.exports = router;
