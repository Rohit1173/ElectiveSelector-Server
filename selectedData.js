const mongoose = require('mongoose')

let selectedDataSchema = mongoose.Schema({
userName:{
 type: String,
 required: true,
},
userEmail:{
    type:String,
    required: true,
},
semNum:{
 type:String,
 required: true,
},
el:{
  type:String,
  required: true,
},
branchList:{
  type:[String],
  required:true,
}


});

module.exports = mongoose.model('selectedData',selectedDataSchema);