const Profile = require("../Models/profileModel");

// There is only ever one profile document. Create an empty one on first read.
const getProfileDoc = async () => {
    let profile = await Profile.findOne();
    if (!profile) {
        profile = await Profile.create({});
    }
    return profile;
};

// GET /profile  (public)
const getProfile = async (req, res) => {
    try {
        const profile = await getProfileDoc();
        return res.status(200).json({ profile });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch profile" });
    }
};

// PUT /profile  (auth) — supports multipart with heroImage / aboutImage / resume files
const updateProfile = async (req, res) => {
    try {
        const profile = await getProfileDoc();
        const body = { ...req.body };

        // Never let the client overwrite these.
        delete body._id;
        delete body.__v;

        // Array fields arrive as JSON strings when sent via multipart form data.
        ["jobTitles", "aboutParagraphs"].forEach((key) => {
            if (typeof body[key] === "string") {
                try { body[key] = JSON.parse(body[key]); } catch (_) { /* leave as-is */ }
            }
        });

        // social may arrive as a JSON string.
        if (typeof body.social === "string") {
            try { body.social = JSON.parse(body.social); } catch (_) { /* leave as-is */ }
        }

        // Uploaded files — multer-storage-cloudinary puts the URL in .path
        if (req.files) {
            if (req.files.heroImage) body.heroImage = req.files.heroImage[0].path;
            if (req.files.aboutImage) body.aboutImage = req.files.aboutImage[0].path;
            if (req.files.resume) body.resumeUrl = req.files.resume[0].path;
        }

        Object.assign(profile, body);
        await profile.save();
        return res.status(200).json({ profile });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to update profile" });
    }
};

module.exports = { getProfile, updateProfile };
