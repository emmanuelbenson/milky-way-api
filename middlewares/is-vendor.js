require("dotenv").config();
const Constants = require("../constants/Constants");
const Errors = require("../libs/errors/errors");
const UtilError = require("../utils/errors");
const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const accountType = parseInt(req.userType);

  if (accountType !== Constants.VENDOR_TYPE) {
    next(
      new Errors.Unauthorized(
        UtilError.parse(
          null,
          "Access denied! You do not have the right access to this resource",
          null,
          null
        )
      )
    );
    return;
  }
  next();
};
