require("dotenv").config();
const Constants = require("../constants/Constants");

module.exports = (req, res, next) => {
  if (!req.headers.source) {
    const error = new Error("Access denied!");
    error.statusCode = 400;
    error.message = "Request source not specified";
    throw error;
  }

  const requestSource = req.headers.source;

  if (requestSource !== Constants.MOBILE || requestSource !== Constants.WEB) {
    const error = new Error("Access denied!");
    error.statusCode = 400;
    throw error;
  }
  next();
};
