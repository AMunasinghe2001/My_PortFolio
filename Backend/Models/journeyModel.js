const mongoose = require("mongoose");

const journeySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            default: "",
        },
        institution: {
            type: String,
            default: "",
        },
        logo: {
            // Full Cloudinary URL of the institution logo.
            type: String,
            default: "",
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("JourneyModel", journeySchema);
