const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        required:true,
        min:12
    }

},{timestamps:true});

const userModel = mongoose.model('users',userSchema);

module.exports= userModel;