require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
  const token = req.headers.authorization.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 401;
    throw err;
  }

  const userId = decodedToken.userId;
  const uuid = decodedToken.uuid;
  const userType = decodedToken.userType;

  req.userId = userId;
  req.uuid = uuid;
  req.userType = userType;

  next();
};
