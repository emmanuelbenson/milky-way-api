const express = require("express");
const router = express.Router();

const User = require("../models/user");
const authController = require("../controllers/auth");

const Status = require("../constants/status");
const ResponseError = require("../constants/responseErrors");

const { body, validatorResult, check, oneOf } = require("express-validator");
const PasswordReset = require("../models/passwordreset");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("email is required")
      .custom((value, { req }) => {
        return User.findOne({ where: { email: value } }).then((userDoc) => {
          if (userDoc) return Promise.reject("E-mail address already taken");
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 8 }),
    body("userType").not().isEmpty().trim().escape(),
    body("firstName").not().isEmpty().trim().escape(),
    body("lastName").not().isEmpty().trim().escape(),
  ],
  authController.signup
);

router.post(
  "/signin",
  [
    body("email").not().isEmpty().trim().escape(),
    body("password").not().isEmpty().trim().escape(),
  ],
  authController.signin
);

router.post(
  "/reset-password",
  [
    body("email")
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("email is required")
      .trim()
      .escape()
      .custom((value, { req }) => {
        return User.findOne({ where: { email: value } }).then((userDoc) => {
          if (!userDoc) return Promise.reject("We do not have such record");
        });
      })
      .normalizeEmail(),
  ],
  authController.resetPassword
);

router.post(
  "/password-reset",
  [
    body("token")
      .not()
      .isEmpty()
      .withMessage("Invalid request")
      .trim()
      .escape()
      .custom((value, { req }) => {
        return PasswordReset.findOne({ where: { token: value } }).then(
          (passwordResetDoc) => {
            if (!passwordResetDoc) {
              return Promise.reject("Invalid password reset token");
            } else if (passwordResetDoc.dataValues.status === Status.EXPIRED) {
              return Promise.reject(ResponseError.TOKEN_EXPIRED);
            }
          }
        );
      }),
  ],
  authController.passwordReset
);

module.exports = router;
