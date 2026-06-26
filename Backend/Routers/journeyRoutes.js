const express = require("express");
const router = express.Router();
const c = require("../Controllers/journeyController");
const verifyToken = require("../Middleware/authMiddleware");
const upload = require("../Middleware/upload");

router.get("/", c.getAllJourney);
router.post("/", verifyToken, upload.single("logo"), c.addJourney);
router.put("/:id", verifyToken, upload.single("logo"), c.updateJourney);
router.delete("/:id", verifyToken, c.deleteJourney);

module.exports = router;
