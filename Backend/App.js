//pass= fhi00XoMrFZHVlNM


//connect express
const express = require("express");

//connect mongoose
const mongoose = require("mongoose"); 

const router = require("./Routers/Routes");

const app = express();

//connect to middleware
// app.use("/",(req,res,next) => {
//     res.send("It is working properly");
// })

//connect to middleware
//insert date use postman and responsive date this json 
app.use(express.json());

app.use("/users",router);



//Data Base Connection 
//call to mongoose
mongoose.connect("mongodb+srv://Anushanga:Anushanga2001@cluster0.4d2u3vi.mongodb.net/")
.then(()=> console.log("Connected to MongoDB")) 
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log((err)));