const express = require('express')
const mongoose = require('mongoose')
const User = require('./user')
const ElectiveData=require('./electiveData')
const SelectedData=require('./selectedData')
const bodyParser = require("body-parser");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt=require("bcrypt")
const nodemailer = require('nodemailer');
const multer = require("multer")
const path = require("path")

require("dotenv").config();
require("dotenv/config");

const maxAge =3*24*60*60
const app = express()
const port = 3000
app.use(cors())
app.use(express.static(__dirname));
// app.use('/uploads', express.static('uploads'));
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

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/uploads/'));
  },
  filename: (req, file, cb) => {
    // const ext = file.mimetype.split("/")[1];
    // cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
    cb(null, path.join(__dirname, '/uploads/'));
  },
});

const upload = multer({
  storage: multerStorage
});


app.post('/upload', upload.single("myPDF"), (req, res) => {
  res.send("saved file- ")
})


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/profVerify',async(req, res) => {
  try {
    let userEmail = req.body.userEmail
    let curSem="NONE"
    if(userEmail==='sairohitchappa01@gmail.com'||userEmail==='sanskrutishahu0804@gmail.com'||userEmail==='matamashu03@gmail.com'||userEmail==='lakshmisharvanivalepe@gmail.com'){
      curSem="NONE"
    }
    else{
     curSem=getsem(userEmail)
    }
    let user= await User.findOne({userEmail: userEmail})
    if(user===null){
      await User.create({userEmail: userEmail,semNum:curSem,el1:req.body.el1,el2:req.body.el2},(err, user) => {
        if(err){
          console.log(err.message);
          res.status(400).json({status:0,message:err.message});
        }
      })
    }
    if(userEmail==='sairohitchappa01@gmail.com'||userEmail==='sanskrutishahu0804@gmail.com'||userEmail==='matamashu03@gmail.com'||userEmail==='lakshmisharvanivalepe@gmail.com'){
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

app.post('/addElectiveDetails', async(req,res)=>{
  try{
    let semNum=req.body.semNum
    let electiveNum=req.body.electiveNum

    const elective = await ElectiveData.findOne({semNum:semNum,electiveNum:electiveNum})
    let flag=false
   if(elective!==null){
     let branchList=req.body.branchList
     let elBranchList=elective.branchList
      flag=commonBranch(branchList,elBranchList)
   }
   if(flag){
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
  let branch=userEmail.substring(1,3);
 
  let branchName
  if(branch=="cs"){
    branchName="CS"
  }
  else if(branch=="it"){
    branchName="IT"
  }
  else if(branch=="ci"){
    branchName="CSAI"
  }
  else if(branch=="cb"){
    branchName="CSB"
  }
  const elective1 = await ElectiveData.findOne({semNum:semNum,electiveNum:'1'})
  const elective2 = await ElectiveData.findOne({semNum:semNum,electiveNum:'2'})
  const user=await User.findOne({userEmail:userEmail})
  let e1s1= {subTitle:"NA",facultyName:"NA",pdfUrl:"NA"}
  let e1s2= {subTitle:"NA",facultyName:"NA",pdfUrl:"NA"}
  let e1s3= {subTitle:"NA",facultyName:"NA",pdfUrl:"NA"}
  let e2s1= {subTitle:"NA",facultyName:"NA",pdfUrl:"NA"}
  let e2s2= {subTitle:"NA",facultyName:"NA",pdfUrl:"NA"}
  let e2s3= {subTitle:"NA",facultyName:"NA",pdfUrl:"NA"}
  let el1branchList=[]
  let el2branchList=[]
  let choiceString1=user.el1
  let choiceString2=user.el2
  if(elective1!==null){
    if(elective1.branchList.includes(branchName)){
     e1s1=elective1.sub1
     e1s2=elective1.sub2
     e1s3=elective1.sub3
     el1branchList=elective1.branchList
    }
  }
  if(elective2!==null){
    if(elective2.branchList.includes(branchName)){
     e2s1=elective2.sub1
     e2s2=elective2.sub2
     e2s3=elective2.sub3
     el2branchList=elective2.branchList
    }
  }
    
  
  res.status(200).json({status:1,message: {e1s1:e1s1,e1s2:e1s2,e1s3:e1s3,choiceString1:choiceString1,el1branchList:el1branchList,e2s1:e2s1,e2s2:e2s2,e2s3:e2s3,choiceString2:choiceString2,el2branchList:el2branchList}});
  }
  catch(err) {
    console.log(err.message);
    res.status(401).json({status:0,message: err.message});

  }
 

})
app.post('/choose',async(req, res)=>{

  try{
  let userEmail = req.body.userEmail
  let userName = req.body.userName
  let semNum=req.body.semNum
  let electiveNum=req.body.electiveNum
  let choiceString=req.body.choiceString
  let branchList=req.body.branchList
  let sub 
  let user = await User.findOne({userEmail: userEmail})
  let elective = await ElectiveData.findOne({semNum:semNum,electiveNum:electiveNum,branchList:branchList})
  if(electiveNum==='1'){
    user.el1=choiceString;
  }
  else{
    user.el2=choiceString;
  }
  await user.save()

  if(elective===null){
    res.status(401).json({status:0,message: "Elective Not Yet Released"});
  }
  else{
    if(choiceString==="100"){
       sub=elective.sub1
    }
    else if(choiceString==="010"){
      sub=elective.sub2
   }
   else if(choiceString==="001"){
    sub=elective.sub3
  }
  SelectedData.find({semNum:semNum,electiveNum:electiveNum,sub:sub,branchList:branchList},(err,semData)=>{
    if(err){
      res.status(401).json({status:0,message: err.message});
    }
    else{
      if(semData.length<=74){
        if(semData.length===74){
          if(choiceString==="100"){
           elective.sub1.subStatus=false
         }
         else if(choiceString==="010"){
           elective.sub2.subStatus=false
        }
        else if(choiceString==="001"){
           elective.sub3.subStatus=false
       }
        }
        SelectedData.create({userName:userName,userEmail:userEmail,sub:sub,semNum:semNum,electiveNum:electiveNum,branchList:branchList},(err, selectedData)=>{
          if(err){
            console.log(err.message);
            res.status(401).json({status:0,message: err.message});
          }
          else{
             res.status(200).json({status: 1, message:"SUCCESS"});
          }
        })


      }
      else{
        
        res.status(401).json({status:0,message: "Elective is Full"});
      }
      
    }
  })
    
  }
}
catch(err) {
  console.log(err.message);
  res.status(401).json({status:0,message: err.message});
}
})
app.post('/branches',async(req,res)=>{
  try{
  let semNum=req.body.semNum;
  let electiveNum=req.body.electiveNum;
  ElectiveData.find({semNum:semNum,electiveNum:electiveNum},(err,data)=>{
    if(err){
      res.status(401).json({status:0,message: err.message});
    }
    else{
      let branches=data.map(item=>item.branchList)
      res.status(200).json({status:1,message: branches});
    }
  })

}
catch(err) {
  console.log(err.message);
res.status(401).json({status:0,message: err.message});
}
})

app.post('/subjects',async(req,res)=>{
  try{
  let semNum=req.body.semNum;
  let electiveNum=req.body.electiveNum;
  let branchList=req.body.branchList;
  let elective = await ElectiveData.findOne({semNum:semNum,electiveNum:electiveNum,branchList:branchList})

  res.status(200).json({status:1,message: {sub1:elective.sub1,sub2:elective.sub2,sub3:elective.sub3}});

}
catch(err) {
  console.log(err.message);
res.status(401).json({status:0,message: err.message});
}
})

app.post('/semData',async(req, res) => {
  try{
  let semNum=req.body.semNum;
  let electiveNum=req.body.electiveNum;
  let sub=req.body.sub
  let branchList=req.body.branchList;
  console.log(semNum,electiveNum,sub,branchList)
  SelectedData.find({semNum:semNum,electiveNum:electiveNum,sub:sub,branchList:branchList},(err,semData)=>{
    if(err){
      res.status(401).json({status:0,message: err.message});
    }
    else{
      console.log(semNum,electiveNum,sub,branchList)
      res.status(200).json({status:1,message: semData});
    }
  })
  
  }
  catch(err) {
    console.log(err.message);
  res.status(401).json({status:0,message: err.message});
  }
})
app.post('/selectedElectives',async(req,res)=>{
  try{
    let userEmail = req.body.userEmail
    let user = await User.findOne({userEmail: userEmail})
    console.log(user)
    let el1 = await ElectiveData.findOne({semNum: user.semNum,electiveNum:1})
    let el2 = await ElectiveData.findOne({semNum: user.semNum,electiveNum:2})
    let sub1= {subTitle:"NA",facultyName:"NA"}
    let sub2= {subTitle:"NA",facultyName:"NA"}
    let s1,s2;
    if(el1!=null){
       s1=user.el1
       if(s1[0]=='1'){
        sub1=el1.sub1
       }
       else if(s1[1]=='1'){
        sub1=el1.sub2
       }
       else if(s1[2]=='1'){
        sub1=el1.sub3
       }
    }
    if(el2!=null){
      s2=user.el2
      if(s2[0]=='1'){
       sub2=el2.sub1
      }
      else if(s2[1]=='1'){
       sub2=el2.sub2
      }
      else if(s2[2]=='1'){
       sub2=el2.sub3
      }
   }

   res.status(200).json({status:1,message: {sub1:sub1,sub2:sub2}});

  }
  catch(err) {
    console.log(err.message);
  res.status(401).json({status:0,message: err.message});
  }
})
function getsem(email) {
let curYear=parseInt(new Date().getFullYear())
let curMonth=parseInt(new Date().getMonth())
let year=parseInt(email.substring(3,7))
let x=curYear-year
if(x==2&&(curMonth>=6&&curMonth<=11)){
  return "5";
}
else if(x==3){
  if(curMonth>=6&&curMonth<=11){
    return "7";
  }
  else{
    return "6";
  }
}


}
function commonBranch(list1, list2) {
  for (const str1 of list1) {
    if (list2.includes(str1)) {
      return true;
    }
  }
  return false;
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

module.exports=app;