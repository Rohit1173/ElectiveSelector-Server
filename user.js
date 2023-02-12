const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

let userSchema = mongoose.Schema({

userEmail:{
    type:String,
    required: true,
},
el1:{
  type:String,
},
el2:{
  type:String,
}

});

module.exports = mongoose.model('User',userSchema);