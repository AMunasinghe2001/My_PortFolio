const express = require("express");
const router = express.Router();
const c = require("../Controllers/serviceController");
const verifyToken = require("../Middleware/authMiddleware");

router.get("/", c.getAllServices);
router.post("/", verifyToken, c.addService);
router.put("/:id", verifyToken, c.updateService);
router.delete("/:id", verifyToken, c.deleteService);

module.exports = router;
