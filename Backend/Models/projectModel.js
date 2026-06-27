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
            // GitHub repository link.
            type: String,
        },
        liveUrl: {
            // Deployed/live website link (optional).
            type: String,
        },
        description: {
            // Longer write-up shown in the project detail popup.
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
