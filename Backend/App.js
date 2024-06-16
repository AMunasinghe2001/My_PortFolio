// connect express
const express = require("express");

// connect mongoose
const mongoose = require("mongoose");

const projectRoutes = require("./Routers/projectRoutes");

const app = express();

// connect to middleware
// insert data using postman and respond with this json
app.use(express.json());

app.use("/projects", projectRoutes);

// Data Base Connection 
// call to mongoose
mongoose.connect("mongodb+srv://Anushanga:Anushanga2001@cluster0.4d2u3vi.mongodb.net/")
    .then(() => console.log("Connected to MongoDB"))
    .then(() => {
        app.listen(5000, () => {
            console.log("Server is running on port 5000");
        });
    })
    .catch((err) => console.log(err));
