const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const database = require("./config/dbConnection");
const jwt = require('jsonwebtoken');
// importing model
const userModel = require("./models/userModel");
app.use(express.json());

// app.use(bodyParser.json());
// console.log(process.env.HOSTNAME);

// app.get('/:age',checkAge,(req,res)=>{
//     res.send("Welcome to Homepage");
// })
// function checkAge(req,res,next){
//     if(req.params.age<18){
//         res.send("U are'nt eligible to access the page");
//     }else{
//         next();
//     }
// }
// app.post('/signup',async(req,res)=>{
//     // let {name,email,password,age} = req.body;
//   let user = req.body;
//   userModel.create(user)
//   .then((data)=>{
//     res.status(200).send({message:"User registered"})
//   })
//   .catch((err)=>{
//     res.status(400);
//     console.log(err);
//     res.send({message:"Some problem"});
//   })
//     //console.log(user);

// })

// app.post("/products",(req,res)=>{
//     let product = '';
//     req.on('data',(chunk)=>{
//         product+=chunk;
//     })
//     req.on('end',()=>{
//         console.log(JSON.parse(product));
//     })
//     res.send({message:"Post Working"})
// })

// app.post('/example', (req, res) => {
//     console.log(req.body); // Contains the parsed JSON data
//     const {username,password}=req.body;
//     console.log(username);
//     console.log(password);
//     res.send('Received JSON data');
// });
// app.delete('/example/:username', (req, res) => {
//     console.log(req.params.username); // Contains the parsed JSON data

//     res.send('Deleted JSON data');
// });
// app.post('/register',(req,res)=>{
//     let data = req.body;
//     bcrypt.genSalt(10,(err,salt)=>{
//         if(!err){
//             bcrypt.hash(data.password,salt,(err,hashPassword)=>{
//                 if(err) {
//                     console.error("Error hashing password:", err);
//                     return res.status(500).send("Error hashing password");
//                 }
//                 console.log("Hashed password is ",hashPassword);
//                 data.password=hashPassword;
//                 res.send({message:"Hashed Successful",data:data});
//             })
//         }
//     })
// })

//register user route

// app.post("/register", (req, res) => {
//   let userData = req.body;
//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) return res.status(500).json({ error: "Error generating salt" });
//     else {
//       bcrypt.hash(userData.password, salt, (err, hashPassword) => {
//         if (!err) {
//           userData.password = hashPassword;
//           userModel
//             .create(userData)
//             .then((doc) => {
//                 console.log(doc);
//               res.status(201).send("User Registered Successfully");
//             })
//             .catch((err) => {
//               console.log(err);
//               res.status(500).json({ error: "Internal Server Error" });
//             });
//         } else {
//           console.log("Error hashing password");
//         }
//       });
//     }
//   });
// });
app.post("/register", (req, res) => {
    let userData = req.body;
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).json({ error: "Error generating salt" });
      else {
        bcrypt.hash(userData.password, salt, async(err, hashPassword) => {
          if (!err) {
            userData.password = hashPassword;
            try{
                 await userModel.create(userData);
                res.status(201).send("User registered Successfully");
            }catch(err){
                console.log(err);
                res.status(500).send({error:"Internal Server error"});
            }
          } else {
            console.log("Error hashing password");
          }
        });
      }
    });
  });

//endpoint for logging 
app.post("/login",async(req,res)=>{
    const userCred = req.body;
    try{
        const user = await userModel.findOne({name:userCred.name});
        if(user!==null){
           await bcrypt.compare(userCred.password,user.password,(err,result)=>{
                if(result){
                  jwt.sign({name:userCred.name},"MRMASUKOJHOL69",(err,token)=>{
                    if(!err) {
                      res.status(200).send({token:token,message:"Login Successful"})
                    }
                  })
                }else{
                    res.status(403).send({error:"Incorrect Password"});
                }
           })

        }else{
            res.status(404).send({user:"user not found"});
        }
    }catch(err){    
        console.log(err);
        res.status(500).send({error:"Internal Server error"});


}

})
app.listen(5000, () => {
  console.log(`Server is up and listening at port 5000`);
});


