const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        technology: {
            type: String,
            required: true,
        },
        url: {
            type: String,
        },
        image: {
            // Full Cloudinary URL of the project image.
            type: String,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProjectModel", projectSchema);
