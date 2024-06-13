//add mongoose
const mongoose = require("mongoose");

//assign to schema
const Schema =mongoose.Schema;

//Connect to the schema, we got inputs details
//create a Schema  function and call it

const userSchema =new Schema ({

    name:{
        type:String, //data type
        required:true, //validate  //must be filled in our inputs
    },
    gmail:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        required:true,
    },
    address:{
        type:String,
        required:true,
    }
});

module.exports = mongoose.model(
    "model", //file name
    userSchema //function
);
