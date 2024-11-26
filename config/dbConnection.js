const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prajwol:root@cluster0.emxcw.mongodb.net/');

const db = mongoose.connection;

db.on('connected',()=>{
    console.log("MongoDB server connected successfully");
})
db.on('error',(err)=>{
    console.log("Error connecting database",err);
})
db.on('disconnected',()=>{
    console.log("MongoDb server Disconnected");
})
