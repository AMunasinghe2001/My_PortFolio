const express = require("express");
const router = express.Router();
const ProjectController = require("../Controllers/projectController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", ProjectController.getAllProjects);
router.post("/", upload.single("image"), ProjectController.addProject);
router.get("/:id", ProjectController.getProjectById);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

module.exports = router;
