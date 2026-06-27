const Journey = require("../Models/journeyModel");

// GET /journey  (public)
const getAllJourney = async (req, res) => {
    try {
        const journey = await Journey.find().sort({ order: 1, createdAt: 1 });
        return res.status(200).json({ journey });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch journey" });
    }
};

// POST /journey  (auth) — optional logo file
const addJourney = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) data.logo = req.file.path; // Cloudinary URL
        const item = new Journey(data);
        await item.save();
        return res.status(201).json({ journey: item });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to add journey item" });
    }
};

// PUT /journey/:id  (auth) — optional new logo
const updateJourney = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) data.logo = req.file.path;
        const item = await Journey.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true,
        });
        if (!item) {
            return res.status(404).json({ message: "Journey item not found" });
        }
        return res.status(200).json({ journey: item });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to update journey item" });
    }
};

// PUT /journey/reorder  (auth) — persist a new display order from drag & drop.
// Body: { ids: [orderedJourneyId, ...] }
const reorderJourney = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: "ids must be an array" });
    }
    try {
        await Promise.all(
            ids.map((id, index) => Journey.findByIdAndUpdate(id, { order: index }))
        );
        return res.status(200).json({ message: "Journey reordered" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Reorder failed" });
    }
};

// DELETE /journey/:id  (auth)
const deleteJourney = async (req, res) => {
    try {
        const item = await Journey.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Journey item not found" });
        }
        return res.status(200).json({ message: "Journey item deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to delete journey item" });
    }
};

module.exports = { getAllJourney, addJourney, updateJourney, reorderJourney, deleteJourney };
