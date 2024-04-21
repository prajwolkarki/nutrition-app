const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nutrify');

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
