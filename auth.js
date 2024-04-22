const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const Person = require("./models/userModel");

async function comparePassword(candidatePassword, hashedPassword) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
}

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Received credentials - Username:", username);
      const user = await Person.findOne({ username: username });

      if (!user) {
        console.log("User not found:", username);
        return done(null, false, { message: "Incorrect username" });
      }

      console.log("User found:", user);

      const isPasswordMatch = await comparePassword(password, user.password);

      console.log("Password match:", isPasswordMatch);

      if (isPasswordMatch) {
        console.log("Password is correct for user:", username);
        return done(null, user);
      } else {
        console.log("Password is incorrect for user:", username);
        return done(null, false, { message: "Incorrect password" });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      return done(error);
    }
  })
);

module.exports = passport;
