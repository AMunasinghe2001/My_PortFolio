const express = require("express");
const mongoose = require("mongoose");
const projectRoutes = require("./Routers/projectRoutes.js");
const cors = require("cors");

const app = express();
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
