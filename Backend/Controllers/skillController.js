const Skill = require("../Models/skillModel");

// GET /skills  (public)
const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ category: 1, order: 1, createdAt: 1 });
        return res.status(200).json({ skills });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch skills" });
    }
};

// POST /skills  (auth)
const addSkill = async (req, res) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        return res.status(201).json({ skill });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to add skill" });
    }
};

// PUT /skills/:id  (auth)
const updateSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }
        return res.status(200).json({ skill });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to update skill" });
    }
};

// DELETE /skills/:id  (auth)
const deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }
        return res.status(200).json({ message: "Skill deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to delete skill" });
    }
};

module.exports = { getAllSkills, addSkill, updateSkill, deleteSkill };
