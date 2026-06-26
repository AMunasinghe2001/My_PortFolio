const mongoose = require("mongoose");

// Singleton document holding all the single-value content of the site
// (hero, about, social links, footer). There is only ever one of these.
const profileSchema = new mongoose.Schema(
    {
        // ---- Home / hero ----
        greeting: { type: String, default: "Hello, It's Me..." },
        name: { type: String, default: "" },
        jobTitles: { type: [String], default: [] },
        intro: { type: String, default: "" },
        resumeUrl: { type: String, default: "" },
        heroImage: { type: String, default: "" },

        // ---- About ----
        aboutHeading: { type: String, default: "About Me" },
        aboutParagraphs: { type: [String], default: [] },
        aboutImage: { type: String, default: "" },

        // ---- Social links ----
        social: {
            facebook: { type: String, default: "" },
            whatsapp: { type: String, default: "" },
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
        },

        // ---- Footer ----
        footerTagline: { type: String, default: "" },
        copyrightName: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProfileModel", profileSchema);
