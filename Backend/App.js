const express = require("express");
const mongoose = require("mongoose");
const projectRoutes = require("./Routers/projectRoutes.js");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

// Set up storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(cors());
app.use("/projects", projectRoutes);

mongoose.connect("mongodb+srv://Anushanga:Anushanga2001@cluster0.4d2u3vi.mongodb.net")
    .then(() => console.log("Connected to MongoDB"))
    .then(() => {
        app.listen(5000, () => {
            console.log("Server is running on port 5000");
        });
    })
    .catch((err) => console.log(err));
