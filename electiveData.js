const mongoose = require('mongoose')

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
        subTitle:{
            type:String,
            required:true
        },
        facultyName:{
            type:String,
            required:true
        },
        pdfUrl:{
            type:String,
            default:"NA",
            required:false
        },
        subStatus:{
            type:Boolean,
            default:true
        }
    },
    sub2:{
        subTitle:{
            type:String,
            required:true
        },
        facultyName:{
            type:String,
            required:true
        },
        pdfUrl:{
            type:String,
            default:"NA",
            required:false
        },
        subStatus:{
            type:Boolean,
            default:true
        }
    },
    sub3:{
        subTitle:{
            type:String,
            required:true
        },
        facultyName:{
            type:String,
            required:true
        },
        pdfUrl:{
            type:String,
            default:"NA",
            required:false
        },
        subStatus:{
            type:Boolean,
            default:true
        }
    },
    branchList:{
        type:[String],
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
    });

    module.exports = mongoose.model('electiveDetails',electiveSchema);