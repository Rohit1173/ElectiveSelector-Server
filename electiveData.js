const mongoose = require('mongoose')

let ElectiveDetails = mongoose.Schema({
    subTitle:{
        type:String,
        required:true
    },
    facultyName:{
        type:String,
        required:true
    }
    });

let electiveSchema = mongoose.Schema({
    semNum:{
        type: String,
        required: true
    },
    electiveNum:{
        type:String,
        required: true,
    },
    sub1:{
        type:ElectiveDetails,
        required: true,
    },
    sub2:{
        type:ElectiveDetails,
        required: true,
    },
    sub3:{
        type:ElectiveDetails,
        required: true,
    },
    addedBy:{
        type:String,
        required: true,
    },
    addedTime:{
        type:String,
        required: true,
    },
    scheduledAt:{
        type:String,
        required: true,
    }
    });

    module.exports = mongoose.model('electiveDetails',electiveSchema);