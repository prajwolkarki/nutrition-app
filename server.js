const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const database = require("./config/dbConnection");
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken");
// importing model
const userModel = require("./models/userModel");
const foodModel = require("./models/foodModel");
const trackingModel = require("./models/trackingModel");

//authenticate using local-strategy
const passport = require("./auth");

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

const authMiddleware = passport.authenticate("local", { session: false });
app.use(passport.initialize());
app.post("/register", (req, res) => {
  let userData = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return res.status(500).json({ error: "Error generating salt" });
    else {
      bcrypt.hash(userData.password, salt, async (err, hashPassword) => {
        if (!err) {
          userData.password = hashPassword;
          try {
            await userModel.create(userData);
            res.status(201).send("User registered Successfully");
          } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal Server error" });
          }
        } else {
          console.log("Error hashing password");
        }
      });
    }
  });
});

//endpoint for logging
app.post("/login", async (req, res) => {
  const userCred = req.body;
  try {
    const user = await userModel.findOne({ username: userCred.username });
    if (user !== null) {
      await bcrypt.compare(userCred.password, user.password, (err, result) => {
        if (result) {
          jwt.sign(
            { name: userCred.username },
            "MRMASUKOJHOL69",
            (err, token) => {
              if (!err) {
                res
                  .status(200)
                  .send({ token: token, message: "Login Successful" });
              }
            }
          );
        } else {
          res.status(403).send({ error: "Incorrect Password" });
        }
      });
    } else {
      res.status(404).send({ user: "user not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server error" });
  }
});

//endpoint to fetch all foods
app.get("/foods", verifyToken, async (req, res) => {
  try {
    const foods = await foodModel.find();
    res.status(200).send(foods);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Problem from fetching data" });
  }
});

app.get("/foods/:food_name",async(req,res)=>{
  try {
    let food = await foodModel.findOne({name:{$regex:req.params.food_name,$options:"i"}});
    res.send(food);
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Problem in getting food"})
  }
})

app.post("/track",async(req,res)=>{
  let trackData = req.body;
  try{
     let data =  await trackingModel.create(trackData);
     res.status(201).send({message:"Food Added"});
  }catch(err){
    console.log(err);
    res.status(501).send({message:"some problem in getting food Data"});
  }
})

//endpoint to fetch food eaten by a person

app.get('/track/:id',verifyToken,async(req,res)=>{
  let userId = req.params.id;
  try {
    let data = await trackingModel.findOne({user:userId}).populate("user").populate('food');
    res.send(data)
  } catch (error) {
    console.log(error);
    res.status(501).send({message:"some problem in getting food Data for given id"});
  
  }
})
app.get('/track/:id/:date',verifyToken,async(req,res)=>{
  let userId = req.params.id;
  let date = new Date(req.params.date);
  let strDate = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
  try {
    let data = await trackingModel.findOne({user:userId,eatenDate:strDate}).populate("user").populate('food');
    res.send(data)
  } catch (error) {
    console.log(error);
    res.status(501).send({message:"some problem in getting food Data for given id and given time"});
  
  }
})
app.listen(5000, () => {
  console.log(`Server is up and listening at port 5000`);
});
