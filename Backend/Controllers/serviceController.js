const Service = require("../Models/serviceModel");

// GET /services  (public)
const getAllServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ order: 1, createdAt: 1 });
        return res.status(200).json({ services });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch services" });
    }
};

// POST /services  (auth)
const addService = async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        return res.status(201).json({ service });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to add service" });
    }
};

// PUT /services/:id  (auth)
const updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(200).json({ service });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to update service" });
    }
};

// DELETE /services/:id  (auth)
const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(200).json({ message: "Service deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to delete service" });
    }
};

module.exports = { getAllServices, addService, updateService, deleteService };
