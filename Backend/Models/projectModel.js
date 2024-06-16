// add mongoose
const mongoose = require("mongoose");

// assign to schema
const Schema = mongoose.Schema;

// create a Schema function and call it
const projectSchema = new Schema({
    title: {
        type: String, // data type
        required: true, // validate, must be filled in our inputs
    },
    technology: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model(
    "ProjectModel", // model name
    projectSchema // schema
);
