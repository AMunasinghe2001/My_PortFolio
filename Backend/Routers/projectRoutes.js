const express = require("express");
const router = express.Router();
const ProjectController = require("../Controllers/projectController");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get("/", ProjectController.getAllProjects);
router.post("/", upload.single("image"), ProjectController.addProject);
router.get("/:id", ProjectController.getProjectById);
router.put("/:id", upload.single("image"), ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

module.exports = router;
