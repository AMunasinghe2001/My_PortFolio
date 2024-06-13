//user model file path
const User = require("../model/model");

//Now we create  function to  display it 
//Get All Users
const getAllUsers = async (req, res ,next) => {

    let users; //assign a variable

    //Get all users
    //return details in our data base
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
    }

    //If not any users in the data base //not found
    if(!users) {
       return res.status(404).json({message:"No users found"});
    }

    //Display all the users in the data base
    return res.status(200).json({users});
};

//Data Insert --> use model for inserting
const addUsers = async (req, res) => {

    //request to the body
    const {name, gmail,age,address} =req.body;

    //crete a variable
    let users;

    try{
      users = new User({name,gmail,age,address});

      //save in data base
      await users.save();
    }catch(err){
        console.log(err);
    }

    //not insert users (data) 
    if(!users) {
       return res.status(404).json({message:"Unable to add users"});
    }
    return res.status(200).json({users});
};

//Get By ID 
//display user details using user id
const getById = async (req, res, next) => {

    const id = req.params.id;

    let users;

    try {
        users = await User.findById(id);
    }catch (err) {
        console.log(err);
    }
     
    //not available users (data) 
    if(!users) {
       return res.status(404).json({message:"User not found"});
    }
    return res.status(200).json({users});
};

//update user Details
const updateUser = async (req, res, next) => {
  //Now Display User Details
  //Now Update User details and update data base
  //Update = display + insert 

  const id = req.params.id;
  const {name,gmail,age,address} =req.body;

  let users;
  try {
    users = await User.findByIdAndUpdate(id, 
        {name:name,gmail:gmail,age:age ,address : address});
        //save Details
        users = await users.save();
  }catch (err) {
    console.log(err);
  }
  //not available users (data) 
  if(!users) {
    return res.status(404).json({message:"Unable to update User details"});
 }
    return res.status(200).json({users});
};


//Delete User Details
const deleteUser = async (req, res,next) => {
    //Delete User
    const id = req.params.id;

    let user;

    try {
        user = await User.findByIdAndDelete(id);
    }catch (err) {
        console.log(err);
    }
    //not available users (data) 
     if(!user) {
    return res.status(404).json({message:"Unable to Delete User details"});
 }
    return res.status(200).json({user});
}


//Expert to the our routs
exports.getAllUsers =  getAllUsers; 

//export addUsers
exports.addUsers = addUsers;

//export getByID
exports.getById = getById;

//export updateUser
exports.updateUser = updateUser;

//export deleteUser
exports.deleteUser = deleteUser;
