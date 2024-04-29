const mongoose = require("mongoose")


const taskSubmitSchema= new mongoose.Schema({
    message:String,
    taskId:String,
    intro:String,
    // confirmPass:String,
    
   
});


const taskSubmit = new mongoose.model("taskSubmit", taskSubmitSchema);

module.exports=taskSubmit;