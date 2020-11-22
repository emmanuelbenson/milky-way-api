require("dotenv").config();
const Constants = require("../constants/Constants");
const Errors = require("../libs/errors/errors");

module.exports = (req, res, next) => {
  if (!req.headers.source) {
    throw new Errors.BadRequest(
      "Access denied! Request resource not specified",
      req.headers.source,
      "resource",
      "header"
    );
  }

  const requestSource = req.headers.source;

  if (requestSource === Constants.MOBILE || requestSource === Constants.WEB) {
    next();
  } else {
    throw new Errors.BadRequest(
      "Access denied! Request resource not specified",
      req.headers.source,
      "resource",
      "header"
    );
  }
};
