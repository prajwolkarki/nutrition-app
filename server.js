const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const database = require("./config/dbConnection");
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken");
const cors = require("cors");
// importing model
const userModel = require("./models/userModel");
const foodModel = require("./models/foodModel");
const trackingModel = require("./models/trackingModel");

//authenticate using local-strategy
const passport = require("./auth");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: 'https://nutritionapp-psi.vercel.app/', // Specific origin
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
            res.status(201).json({ message: "User registered Successfully" });
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
app.get("/",(req,res)=>{
  res.json("Nutrition Backend");
})
//endpoint for logging
app.post("/login", async (req, res) => {
  const userCred = req.body;
  try {
    const user = await userModel.findOne({ username: userCred.username });
    if (user !== null) {
      bcrypt.compare(userCred.password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign({ name: userCred.username }, "MRMASUKOJHOL69");
          res.status(200).json({
            token: token,
            message: "Login Successful",
            userId: user._id,
            name: user.username,
          });
        } else {
          res.status(403).send({ error: "Incorrect Password" });
        }
      });
    } else {
      res.status(404).send({ user: "User not found" });
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

app.get("/foods/:food_name", async (req, res) => {
  try {
    let food = await foodModel.find({
      name: { $regex: req.params.food_name, $options: "i" },
    });
    if (food.length > 0) {
      res.status(200).send(food);
    } else {
      res.status(404).send({ message: "Food Item Not Fund" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Problem in getting food" });
  }
});

app.post("/track", async (req, res) => {
  let trackData = req.body;
  try {
    let data = await trackingModel.create(trackData);
    res.status(201).json({ message: "Food Added" });
  } catch (err) {
    console.log(err);
    res.status(501).json({ message: "some problem in getting food Data" });
  }
});

//endpoint to fetch food eaten by a person

app.get("/track/:id", verifyToken, async (req, res) => {
  let userId = req.params.id;
  try {
    let data = await trackingModel
      .findOne({ user: userId })
      .populate("userId")
      .populate("foodId");
    res.send(data);
  } catch (error) {
    console.log(error);
    res
      .status(501)
      .json({ message: "some problem in getting food Data for given id" });
  }
});
app.get("/track/:userId/:date", async (req, res) => {
  let userId = req.params.userId;
  let date = new Date(req.params.date);
  let strDate =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

  try {
    let foods = await trackingModel
      .find({ userId: userId, eatenDate: strDate })
      .populate("userId")
      .populate("foodId");
    res.send(foods);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some Problem in getting the food" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is up and listening at port ${PORT}`);
});

