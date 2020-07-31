require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 400;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated!");
    error.statusCode = 401;
    throw error;
  }
  const userId = decodedToken.userid;
  const uuid = decodedToken.uuid;
  const userType = decodedToken.userType;

  req.userId = userId;
  req.uuid = uuid;
  req.userType = userType;

  next();
};
