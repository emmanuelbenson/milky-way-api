const { validationResult } = require("express-validator");
const SendError = require("./errors");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    SendError.send(422, "Validation fields", errors, next);
  }
};

exports.isEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
