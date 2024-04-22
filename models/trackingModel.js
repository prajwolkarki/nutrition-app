const mongoose = require('mongoose');


const trackingSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    food:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'foods'
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    eatenDate:{
        type:String,
        default: new Date().toLocaleDateString()
    }
},{timestamps:true})

const trackingModel = mongoose.model('trackings',trackingSchema);
module.exports=trackingModel;