require("dotenv").config();
const jwt = require("jsonwebtoken");
const Errors = require("../libs/errors/errors");
const UtilError = require("../utils/errors");
const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      new Errors.Unauthorized(
        UtilError.parse(null, "Access denied!", null, null)
      )
    );
    return;
  }
  const token = req.headers.authorization.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    next(
      new Errors.Unauthorized(UtilError.parse(null, err.message, null, null))
    );
    return;
  }

  const userId = decodedToken.userId;
  const uuid = decodedToken.uuid;
  const userType = decodedToken.userType;

  req.userId = userId;
  req.uuid = uuid;
  req.userType = userType;

  next();
};
