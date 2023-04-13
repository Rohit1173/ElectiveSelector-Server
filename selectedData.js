const mongoose = require('mongoose')
const ElectiveDetails= require('./electiveData')

let selectedDataSchema = mongoose.Schema({
userName:{
 type: String,
 required: true,
},
userEmail:{
    type:String,
    required: true,
},
sub:{
  subTitle:{
    type:String,
    required:true
},
facultyName:{
    type:String,
    required:true
}
},
semNum:{
 type:String,
 required: true,
},
electiveNum:{
  type:String,
  required: true,
},
branchList:{
  type:[String],
  required:true,
}


});

module.exports = mongoose.model('selectedData',selectedDataSchema);