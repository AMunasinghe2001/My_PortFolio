const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        category: {
            type: String,
            enum: ["technical", "professional"],
            default: "technical",
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SkillModel", skillSchema);
