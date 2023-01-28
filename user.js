const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

let userSchema = mongoose.Schema({
userName:{
    type:String,
    required: true,
},
userEmail:{
    type:String,
    required: true,
},
userPassword:{
    type:String,
    required: true,
}
});

userSchema.pre('save',async function (next){
  try{
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.userPassword,salt)
    this.userPassword = hashedPassword
    next()
  }
  catch(err){
    next(err);
  }
})
module.exports = mongoose.model('User',userSchema);