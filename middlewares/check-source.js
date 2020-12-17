require("dotenv").config();
const Constants = require("../constants/Constants");
const Errors = require("../libs/errors/errors");
const UtilError = require("../utils/errors");
const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  if (!req.headers.source) {
    next(
      new Errors.BadRequest(
        UtilError.parse(
          null,
          "Access denied! Request resource not specified",
          null,
          "header"
        )
      )
    );
    return;
  }

  const requestSource = req.headers.source;

  if (requestSource === Constants.MOBILE || requestSource === Constants.WEB) {
    next();
  } else {
    next(
      new Errors.BadRequest(
        UtilError.parse(
          null,
          "Access denied! Request resource not specified",
          null,
          "header"
        )
      )
    );
    return;
  }
};
