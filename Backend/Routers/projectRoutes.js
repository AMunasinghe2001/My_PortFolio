const express = require("express");
const router = express.Router();
const ProjectController = require("../Controllers/projectController");
const verifyToken = require("../Middleware/authMiddleware");
const upload = require("../Middleware/upload");

router.get("/", ProjectController.getAllProjects);
router.post("/", verifyToken, upload.single("image"), ProjectController.addProject);
router.get("/:id", ProjectController.getProjectById);
router.put("/:id", verifyToken, upload.single("image"), ProjectController.updateProject);
router.delete("/:id", verifyToken, ProjectController.deleteProject);

module.exports = router;
