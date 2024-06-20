const express = require("express");
const mongoose = require("mongoose");
const projectRoutes = require("./Routers/projectRoutes.js");
const cors = require("cors");
const path = require("path");

const app = express();
//deploy vercel 
app.use(cors(
    
    {
        origin: ["https://anushanga_munasinghe.vercel.app"],
        methods:["GET","POST","PUT","DELETE"],
        credentials: true
    }
));

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
