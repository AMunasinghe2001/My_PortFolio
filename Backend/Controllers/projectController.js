const mongoose = require("mongoose");
const Project = require("../Models/projectModel");
const { isMongoReady } = require("../utils/mongoStatus");

// GET /projects  (public)
const getAllProjects = async (req, res) => {
    try {
        let projects = [];
        if (isMongoReady()) {
            projects = await Project.find().sort({ order: 1, createdAt: 1 });
        }
        if (!projects || projects.length === 0) {
            // If database has no manually seeded projects, automatically serve dynamic GitHub projects!
            const { getGithubProjects } = require("./githubProjectsController");
            return getGithubProjects(req, res);
        }
        return res.status(200).json({ projects });
    } catch (err) {
        console.log(err);
        try {
            const { getGithubProjects } = require("./githubProjectsController");
            return getGithubProjects(req, res);
        } catch {
            return res.status(500).json({ message: "Unable to fetch projects" });
        }
    }
};

// POST /projects  (auth)
const addProject = async (req, res) => {
    const { title, technology, url, liveUrl, description, order } = req.body;
    const image = req.file ? req.file.path : undefined; // Cloudinary URL
    try {
        if (!isMongoReady()) {
            return res.status(503).json({ message: "MongoDB is unavailable" });
        }
        // Check if project with same url already exists, update instead of duplicate
        let project = null;
        if (url) {
            project = await Project.findOne({ url });
        }
        if (project) {
            if (title !== undefined) project.title = title;
            if (technology !== undefined) project.technology = technology;
            if (liveUrl !== undefined) project.liveUrl = liveUrl;
            if (description !== undefined) project.description = description;
            if (order !== undefined) project.order = order;
            if (image) project.image = image;
            await project.save();
            return res.status(200).json({ project });
        }

        project = new Project({ title, technology, url, liveUrl, description, image, order });
        await project.save();
        return res.status(201).json({ project });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to add project" });
    }
};

// GET /projects/:id  (public)
const getProjectById = async (req, res) => {
    const id = req.params.id;
    try {
        let project = null;
        if (isMongoReady() && mongoose.Types.ObjectId.isValid(id)) {
            project = await Project.findById(id);
        }
        if (!project && isMongoReady()) {
            project = await Project.findOne({
                $or: [
                    { url: new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") },
                    { title: new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
                ]
            });
        }
        if (project) {
            return res.status(200).json({ project });
        }
        return res.status(404).json({ message: "Project not found" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch project" });
    }
};

// PUT /projects/:id  (auth)
const updateProject = async (req, res) => {
    const id = req.params.id;
    const { title, technology, url, liveUrl, description, order } = req.body;
    const image = req.file ? req.file.path : null; // Cloudinary URL
    try {
        if (!isMongoReady()) {
            return res.status(503).json({ message: "MongoDB is unavailable" });
        }
        let project = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            project = await Project.findById(id);
        }
        if (!project && url) {
            project = await Project.findOne({ url });
        }
        if (!project) {
            // Upsert as new project entry if ID is a GitHub node_id not yet in MongoDB
            project = new Project({
                title,
                technology,
                url,
                liveUrl,
                description,
                image: image || undefined,
                order: order || 0,
            });
            await project.save();
            return res.status(200).json({ project });
        }
        if (title !== undefined) project.title = title;
        if (technology !== undefined) project.technology = technology;
        if (url !== undefined) project.url = url;
        if (liveUrl !== undefined) project.liveUrl = liveUrl;
        if (description !== undefined) project.description = description;
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
    const id = req.params.id;
    try {
        if (!isMongoReady()) {
            return res.status(503).json({ message: "MongoDB is unavailable" });
        }
        let project = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            project = await Project.findByIdAndDelete(id);
        }
        if (!project) {
            return res.status(200).json({ message: "Project removed successfully" });
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
