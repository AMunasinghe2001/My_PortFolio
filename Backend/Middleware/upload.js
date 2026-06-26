const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Stores uploads on Cloudinary. Images go to the "image" resource type;
// PDFs (e.g. the resume) go to "raw" so they download/serve correctly.
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === "application/pdf";
        if (isPdf) {
            // Store the resume as raw with a fixed ".pdf" public_id so the
            // delivery URL ends in .pdf and downloads as a real PDF file.
            return {
                folder: "portfolio",
                resource_type: "raw",
                public_id: "resume.pdf",
                overwrite: true,
                unique_filename: false,
                use_filename: false,
            };
        }
        return { folder: "portfolio", resource_type: "image" };
    },
});

const upload = multer({ storage });

module.exports = upload;
