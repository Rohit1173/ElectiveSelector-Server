const express = require('express')
const mongoose = require('mongoose')
const User = require('./user')
const ElectiveData=require('./electiveData')
const bodyParser = require("body-parser");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt=require("bcrypt")
const nodemailer = require('nodemailer');

require("dotenv").config();
require("dotenv/config");

const maxAge =3*24*60*60
const app = express()
const port = 3000
app.use(cors())
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

mongoose.set('strictQuery', true);

const connectDatabase = async () => {
  try {    
    await mongoose.connect(process.env.DATABASE);

    console.log("connected to database");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDatabase();


let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.pass
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login',async (req, res) => {
  try{
    let userName= req.body.userName
    let userPassword= req.body.userPassword
    let user=await User.findOne({userName:userName});
  
    if(user===null){
      res.status(404).json({status: 0,message:"User not found"})
    }
    else{
    
    if(bcrypt.compare(userPassword,user.userPassword)){
      const payload = {userName:userName,userPassword:userPassword} ;
    const secret = process.env.SECRET_KEY;
    const options = { expiresIn:maxAge };
    const token = jwt.sign(payload, secret, options);
    // Send response
    res.status(200).json({status: 1, message: token});
    }
    else{
      res.status(404).json({status: 0,message:"Incorrect Password"})
    }
  }

  }
  catch(err){
    console.error(err);
    res.status(400).json({status: 0, message: err});
  }

})
app.post('/signup', async (req, res) => {
  try{
    let userName = req.body.userName
    let userEmail = req.body.userEmail
    let userPassword = req.body.userPassword
    console.log(req.body)
    let x=await User.findOne({userName: userName});
    let y=await User.findOne({userEmail: userEmail});
    if(x!==null){
      res.status(404).json({status: 0,message:"UserName Already Exists , use a Different one"})
    }
    if(y!==null){
      res.status(404).json({status: 0,message:"E-mail Already Exists try Login Instead"})
    }
    User.create(req.body,(err, user)=>{
      if(err){
        console.log(err.message);
        res.status(400).json({status:0,message:err.message});
      }
      const payload = {userName:userName,userPassword:userPassword} ;
               const secret = process.env.SECRET_KEY;
               const options = { expiresIn:maxAge };
               const token = jwt.sign(payload, secret, options);
               res.status(200).json({status: 1, message: token});
    })
  }
  catch(err){
    console.error(err.message);
    res.status(400).json({status: 0, message: err.message});
  }

})
app.post('/profVerify',async(req, res) => {
  try {
    let userEmail = req.body.userEmail
    let user= await User.findOne({userEmail: userEmail})
    if(user===null){
      await User.create(req.body,(err, user) => {
        if(err){
          console.log(err.message);
          res.status(400).json({status:0,message:err.message});
        }
      })
    }
    if(userEmail==='sairohitchappa01@gmail.com'){
      res.status(200).json({status:1,message:"prof"})
    }
    else{
      res.status(200).json({status:1,message:"student"})
    }

  }catch (error) {
    console.log(error.message)
       res.status(401).json({status: 0, message: error.message});
  }
})

app.get("/jwt",(req, res) => {
    try{
      let secretKey=process.env.SECRET_KEY
      const token = req.get("auth-token");
      const verfied=jwt.verify(token,secretKey);
      if(verfied){
        console.log("SUCCESSFULLY VERIFIED")
         res.status(200).json({status: 1, message: "SUCCESSFULLY VERIFIED"});
        }else{
          console.log("NOT VERIFIED")
             res.status(401).json({status: 0, message: "NOT VERFIED"});
        }
    } catch (error) {
      console.log(error.message)
         res.status(401).json({status: 0, message: error.message});
    }
});

app.post('/otp',async (req, res) => {
  try{
    let userName=req.body.userName
    let userEmail=req.body.userEmail
    const otp=Math.floor(1000+Math.random()*9000)
    let mailOptions = {
      from: process.env.email,
      to: userEmail,
      subject: 'Email Verification for LogIn-SignUp App',
      text: `Hi ${userName} , here is your otp for the Login SignUp App : ${otp}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.status(401).json({status:0,message: error.message});
      } else {
        // const salt =  bcrypt.genSalt(10)
        // const hashedOtp =  bcrypt.hash(otp,salt)
        console.log('Email sent: ' + info.response);

        res.status(200).json({status:1,message:otp});
      }
    });
  
    
   
  }
  catch(err) {
    console.log(err.message);
    res.status(401).json({status:0,message: err.message});

  }
})
app.post('/addElectiveDetails', async(req,res)=>{
  try{
    let semNum=req.body.semNum
    let electiveNum=req.body.electiveNum

    const elective = await ElectiveData.findOne({semNum:semNum,electiveNum:electiveNum})
   if(elective!==null){
      console.log("You Have Already added Subjects for this Elective , Try contacting the Developer")
      res.status(401).json({status:0,message: "You Have Already added Subjects for this Elective , Try contacting the Developer"});
   }
   else{
   
ElectiveData.create(req.body,(err, electiveData)=>{
  if(err){
    console.log(err.message);
    res.status(401).json({status:0,message: err.message});
  }
  else{
     res.status(200).json({status: 1, message:"SUCCESS"});
  }
})
}
    
  }
  catch(err) {
    console.log(err.message);
    res.status(401).json({status:0,message: err.message});

  }
})
app.get('/announcement',async(req, res)=>{
  ElectiveData.find({},(err, data)=>{
    if (err) {
      console.log({status: 0, message: err});
      res.status(401).json({status: 0, message: err});
  } else {
      res.status(200).json({status: 1, message:data});
  }
  })

})
app.post('/sem',async(req,res)=>{

  try{
  let semNum=req.body.semNum
  let userEmail=req.body.userEmail
  const elective1 = await ElectiveData.findOne({semNum:semNum,electiveNum:'1'})
  const elective2 = await ElectiveData.findOne({semNum:semNum,electiveNum:'2'})
  const user=await User.findOne({userEmail:userEmail})
  let e1s1= {subTitle:"NA",facultyName:"NA"}
  let e1s2= {subTitle:"NA",facultyName:"NA"}
  let e1s3= {subTitle:"NA",facultyName:"NA"}
  let e2s1= {subTitle:"NA",facultyName:"NA"}
  let e2s2= {subTitle:"NA",facultyName:"NA"}
  let e2s3= {subTitle:"NA",facultyName:"NA"}
  let scheduledAt1="NA"
  let scheduledAt2="NA"
  let choiceString1="000"
  let choiceString2="000"
  if(elective1!==null){
     e1s1=elective1.sub1
     e1s2=elective1.sub2
     e1s3=elective1.sub3
     scheduledAt1=elective1.scheduledAt
     if(e1s1!=='NA'){
      choiceString1[0]='2'
     }
     if(e1s2!=='NA'){
      choiceString1[1]='2'
     }
     if(e1s3!=='NA'){
      choiceString1[2]='2'
     }
  }
  if(elective2!==null){
     e2s1=elective2.sub1
     e2s2=elective2.sub2
     e2s3=elective2.sub3
     scheduledAt2=elective2.scheduledAt
     if(e2s1!=='NA'){
      choiceString2[0]='2'
     }
     if(e2s2!=='NA'){
      choiceString2[1]='2'
     }
     if(e2s3!=='NA'){
      choiceString2[2]='2'
     }
  }
  if(user.el1!==undefined){
    choiceString1=user.el1
  }
  if(user.el2!==undefined){
    choiceString2=user.el2
  }
  res.status(200).json({status:1,message: {e1s1:e1s1,e1s2:e1s2,e1s3:e1s3,scheduledAt1:scheduledAt1,choiceString1:choiceString1,e2s1:e2s1,e2s2:e2s2,e2s3:e2s3,scheduledAt2:scheduledAt2,choiceString2:choiceString2}});
  }
  catch(err) {
    console.log(err.message);
    res.status(401).json({status:0,message: err.message});

  }
 

})
app.post('/choose',async(req, res)=>{

  try{
  let userEmail = req.body.userEmail
  let semNum=req.body.semNum
  let electiveNum=req.body.electiveNum
  let choiceString=req.body.choiceString
  let user = await User.findOne({userEmail: userEmail})
  if(electiveNum==='1'){
    user.el1=choiceString;
  }
  else{
    user.el2=choiceString;
  }
  await user.save()
  res.status(200).json({status: 1, message:"SUCCESS"});
}
catch(err) {
  console.log(err.message);
  res.status(401).json({status:0,message: err.message});

}

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

module.exports=app;