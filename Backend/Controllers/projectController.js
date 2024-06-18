const Project = require("../Models/projectModel");

// Get All Projects
const getAllProjects = async (req, res, next) => {
    let projects;
    try {
        projects = await Project.find();
    } catch (err) {
        console.log(err);
    }
    if (!projects) {
        return res.status(404).json({ message: "No projects found" });
    }
    return res.status(200).json({ projects });
};

// Add New Project
const addProject = async (req, res) => {
    const { title, technology, url } = req.body;
    const image = req.file ? req.file.filename : null;
    let project;
    try {
        project = new Project({ title, technology, url, image });
        await project.save();
    } catch (err) {
        console.log(err);
    }
    if (!project) {
        return res.status(404).json({ message: "Unable to add project" });
    }
    return res.status(200).json({ project });
};

// Get Project By ID
const getProjectById = async (req, res, next) => {
    const id = req.params.id;
    let project;
    try {
        project = await Project.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ project });
};

// Update Project
const updateProject = async (req, res, next) => {
    const id = req.params.id;
    const { title, technology, url } = req.body;
    let project;
    try {
        project = await Project.findByIdAndUpdate(id, { title, technology, url }, { new: true });
    } catch (err) {
        console.log(err);
    }
    if (!project) {
        return res.status(404).json({ message: "Unable to update project" });
    }
    return res.status(200).json({ project });
};

// Delete Project
const deleteProject = async (req, res, next) => {
    const id = req.params.id;
    let project;
    try {
        project = await Project.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    if (!project) {
        return res.status(404).json({ message: "Unable to delete project" });
    }
    return res.status(200).json({ message: "Project deleted successfully" });
};

// Export the controller functions
exports.getAllProjects = getAllProjects;
exports.addProject = addProject;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
