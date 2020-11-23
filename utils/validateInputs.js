const { validationResult } = require("express-validator");
const Errors = require("../libs/errors/errors");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new Errors.UnprocessableEntity(errors))
  }
};

exports.parseError = (value, msg, param, location) => {
  return [{value: value, msg: msg, param: param, location: location}];
}

exports.isEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
