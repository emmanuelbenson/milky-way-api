require("dotenv").config();
const { validationResult, check, oneOf } = require("express-validator");
const bcrypt = require("bcryptjs");
const { uuid } = require("uuidv4");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const moment = require("moment");
const Status = require("../constants/status");

const User = require("../models/user");
const Profile = require("../models/profile");
const PasswordReset = require("../models/passwordreset");

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
  const userType = req.body.userType;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      User.create({
        email: email,
        uuid: uuid(),
        password: hashedPassword,
        userType: userType,
      })
        .then((user) => {
          Profile.create({
            firstName: firstName,
            lastName: lastName,
            userId: user.dataValues.id,
          })
            .then((profile) => {
              const data = {};
              data.statusCode = 201;
              data.message = "Account created successfully";
              data.data = {
                id: user.dataValues.id,
                uuid: user.dataValues.uuid,
              };
              res.status(201).json(data);
            })
            .catch((err) => {
              const error = new Error(err.errors[0].message);
              error.statusCode = 500;
              error.data = err.errors[0];
              delete error.data.origin;
              delete error.data.instance;
              delete error.data.validatorKey;
              delete error.data.validatorName;
              delete error.data.validatorArgs;
              next(error);
            });
        })
        .catch((err) => {
          const error = new Error(err.errors[0].message);
          error.statusCode = 500;
          error.data = err.errors[0];
          delete error.data.origin;
          delete error.data.instance;
          delete error.data.validatorKey;
          delete error.data.validatorName;
          delete error.data.validatorArgs;
          next(error);
        });
    })
    .catch((err) => {
      const error = err;
      error.statusCode = 500;
      next(error);
    });
};

exports.signin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, password } = req.body;
  User.findOne({ where: { email: email } })
    .then((account) => {
      if (!account) {
        error = new Error("These credentials do not match our records.");
        error.statusCode = 401;
        const errors = {
          errors: [
            {
              value: "",
              msg: "Invalid email/password",
              param: "email/password",
              location: "body",
            },
          ],
        };
        error.data = errors;
        throw error;
      }

      const user = account.dataValues;
      bcrypt
        .compare(password, user.password)
        .then((isEqual) => {
          if (!isEqual) {
            error = new Error("These credentials do not match our records.");
            error.statusCode = 401;
            const errors = {
              errors: [
                {
                  value: "",
                  msg: "Invalid email/password",
                  param: "email/password",
                  location: "body",
                },
              ],
            };
            error.data = errors;
            throw error;
          }
          const token = jwt.sign({}, process.env.JWT_SECRET, {
            expiresIn: "30s",
          });
          const data = {
            token: token,
            userId: user.userId,
            uuid: user.uuid,
            userType: user.userType,
          };
          res.status(200).json({ data: data });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      const error = err;
      error.statusCode = 404;
      next(err);
    });
};

exports.resetPassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err !== null) {
      console.log(err);
      const error = new Error("Internal server error");
      error.statusCode = 500;
      error.data = err.array();
      throw error;
    }
    const token = buffer.toString("hex");
    PasswordReset.create({
      email: email,
      token: token,
      expiresIn: moment().add(2, "h"), // Expires in 1hr or 2hrs in daylight saving
      status: Status.UNEXPIRED,
    })
      .then(() => {
        // Send email
        const data = {};
        data.message = `Password reset link sent to ${email}`;
        data.status = "success";
        res.status(200).json(data);
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(err.errors[0].message);
        error.statusCode = 500;
        error.data = err.errors[0];
        delete error.data.origin;
        delete error.data.instance;
        delete error.data.validatorKey;
        delete error.data.validatorName;
        delete error.data.validatorArgs;
        next(error);
      });
  });
};

exports.passwordReset = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { token, oldPassword, newPassword } = req.body;
  const fieldsErrors = [];
  if (oldPassword === undefined || oldPassword === "") {
    const error = {
      value: oldPassword,
      msg: "old password is required",
      param: "oldPassword",
      location: "body",
    };
    fieldsErrors.push(error);
  }
  if (newPassword === undefined || newPassword === "") {
    const error = {
      value: newPassword,
      msg: "new password is required",
      param: "newPassword",
      location: "body",
    };
    fieldsErrors.push(error);
  }

  if (fieldsErrors.length > 0) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    error.data = fieldsErrors;

    throw error;
  }

  PasswordReset.findOne({
    where: { token: token },
  })
    .then((result) => {
      const passwordResetRequest = result.dataValues;

      if (passwordResetRequest.expiresIn >= moment()) {
        bcrypt
          .hash(newPassword, 12)
          .then((hashedPassword) => {
            User.update(
              { password: hashedPassword },
              { where: { email: passwordResetRequest.email } }
            )
              .then(() => {
                const data = {
                  status: "success",
                  message: "Password reset was successful",
                };
                PasswordReset.update(
                  { status: Status.EXPIRED },
                  { where: { token: token } }
                );
                res.status(201).json(data);
              })
              .catch((err) => {
                console.log(err);
                const error = new Error(err.errors[0].message);
                error.statusCode = 500;
                error.data = err.errors[0];
                delete error.data.origin;
                delete error.data.instance;
                delete error.data.validatorKey;
                delete error.data.validatorName;
                delete error.data.validatorArgs;
                next(error);
              });
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(err.errors[0].message);
            error.statusCode = 500;
            error.data = err.errors[0];
            delete error.data.origin;
            delete error.data.instance;
            delete error.data.validatorKey;
            delete error.data.validatorName;
            delete error.data.validatorArgs;
            next(error);
          });
      } else {
        PasswordReset.update(
          { status: Status.EXPIRED },
          { where: { token: token } }
        );
        const err = {
          value: "",
          msg: "Token expired",
          param: "token",
          location: "body",
        };

        const error = new Error("Validation field");
        error.statusCode = 422;
        error.data = [err];

        throw error;
      }
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.statusCode = 500;
      error.data = err;
      next(error);
    });
};
