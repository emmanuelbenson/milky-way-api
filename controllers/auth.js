const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const { uuid } = require("uuidv4");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      User.create({ email: email, uuid: uuid(), password: hashedPassword })
        .then((user) => {
          res.status(201).json(user);
        })
        .catch((err) => {
          const error = new Error(error.message);
          error.statusCode = 422;
          error.data = err.errors.validationErrorItem;
          delete error.data.origin;
          delete error.data.instance;
          delete error.data.validatorKey;
          delete error.data.validatorName;
          delete error.data.validatorArgs;
          throw error;
        });
    })
    .catch((err) => {
      const error = err;
      error.statusCode = 500;
      throw error;
    });
};
