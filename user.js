const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

let userSchema = mongoose.Schema({

userEmail:{
    type:String,
    required: true,
},
semNum:{
 type:String,
 required: true,
},
el1:{
  type:String,
  default:'222'
},
el2:{
  type:String,
  default:'222'
}

});

module.exports = mongoose.model('User',userSchema);