const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        icon: {
            // react-icons key string, e.g. "FaLaptopCode". Mapped to a
            // component on the frontend (see Services/iconMap).
            type: String,
            default: "FaCogs",
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ServiceModel", serviceSchema);
