const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, "MRMASUKOJHOL69", (err, result) => {
        if (err) {
          res.status(401).send({ message: "Token verification failed" });
        } else {
          next(); 
        }
      });
    } else {
      res.status(401).send({ message: "Please send the Token!!" });
    }
  }
  module.exports = verifyToken;