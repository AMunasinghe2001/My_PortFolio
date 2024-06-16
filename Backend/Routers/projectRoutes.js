// import routers
const express = require("express");

// import express
const router = express.Router();

// insert models
const Project = require("../Models/projectModel");

// insert Project Controller
const ProjectController = require("../Controllers/projectController");

// getAllProjects, addProject are function names
// Create Route Path
router.get("/", ProjectController.getAllProjects);

// add project route path
router.post("/", ProjectController.addProject);

// add project route path using id
// id --> Controller const id = req.params.id;
router.get("/:id", ProjectController.getProjectById);

// add project route path for update project
router.put("/:id", ProjectController.updateProject);

// add project route path for delete project
router.delete("/:id", ProjectController.deleteProject);

// export
module.exports = router;
