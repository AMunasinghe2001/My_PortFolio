const express = require("express");
const router = express.Router();
const c = require("../Controllers/skillController");
const verifyToken = require("../Middleware/authMiddleware");

router.get("/", c.getAllSkills);
router.post("/", verifyToken, c.addSkill);
router.put("/:id", verifyToken, c.updateSkill);
router.delete("/:id", verifyToken, c.deleteSkill);

module.exports = router;
