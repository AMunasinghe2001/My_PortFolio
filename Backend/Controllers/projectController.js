const Project = require("../Models/projectModel");

// GET /projects  (public)
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ order: 1, createdAt: 1 });
        return res.status(200).json({ projects });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch projects" });
    }
};

// POST /projects  (auth)
const addProject = async (req, res) => {
    const { title, technology, url, order } = req.body;
    const image = req.file ? req.file.path : undefined; // Cloudinary URL
    try {
        const project = new Project({ title, technology, url, image, order });
        await project.save();
        return res.status(201).json({ project });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to add project" });
    }
};

// GET /projects/:id  (public)
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json({ project });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch project" });
    }
};

// PUT /projects/:id  (auth)
const updateProject = async (req, res) => {
    const { title, technology, url, order } = req.body;
    const image = req.file ? req.file.path : null; // Cloudinary URL
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (title !== undefined) project.title = title;
        if (technology !== undefined) project.technology = technology;
        if (url !== undefined) project.url = url;
        if (order !== undefined) project.order = order;
        if (image) project.image = image;
        await project.save();
        return res.status(200).json({ project });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to update project" });
    }
};

// DELETE /projects/:id  (auth)
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Unable to delete project" });
        }
        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to delete project" });
    }
};

module.exports = {
    getAllProjects,
    addProject,
    getProjectById,
    updateProject,
    deleteProject,
};
