//import routers
const express = require("express");

//import express
const router = express.Router();

//insert models
const  User = require("../model/model");

//insert User Controller
const UserController = require("../Controllers/Controllers");

//getAllUsers , addUsers  are function names
//Create Route Path
router.get("/",UserController.getAllUsers);

//add user route path
router.post("/",UserController.addUsers);

//add user route path use  id
//id --> Controller const id =req.params.id;
router.get("/:id",UserController.getById);

//add user route path for update user
router.put("/:id",UserController.updateUser);

//add user route path for delete user
router.delete("/:id",UserController.deleteUser);



//export
module.exports = router;