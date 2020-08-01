require("dotenv").config();
const Constants = require("../constants/Constants");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const accountType = parseInt(req.userType);

  if (accountType !== Constants.ADMIN_TYPE) {
    const error = new Error(
      "You do not have the permission to access this resource!"
    );
    error.statusCode = 401;
    throw error;
  }
  next();
};
