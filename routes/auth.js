const express = require("express");
const router = express.Router();

const User = require("../models/user");
const authController = require("../controllers/auth");
const IsAuth = require("../middlewares/is-auth");
const IsAdmin = require("../middlewares/is-admin");

const Status = require("../constants/status");
const ResponseError = require("../constants/responseErrors");

const { body, validatorResult, check, oneOf } = require("express-validator");
const PasswordReset = require("../models/passwordreset");

router.post(
  "/signup",
  [
    body("password").trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body("phoneNumber").trim().isLength({ min: 7, max: 11 }).withMessage('Phone Number must be 7 or 11 characters long'),
    body("userType").not().isEmpty().trim().escape(),
    body("firstName").not().isEmpty().trim().escape(),
    body("lastName").not().isEmpty().trim().escape(),
  ],
  authController.signup
);

router.post(
  "/signin",
  [
    body("phoneNumber")
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 7, max: 11 })
      .escape(),
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
    body("email")
      .isEmail()
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .trim()
      .escape(),
    body("newPassword")
      .not()
      .isEmpty()
      .withMessage("New password is required")
      .trim()
      .escape(),
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

router.post(
  "/account/change-state",
  IsAdmin,
  IsAuth,
  [
    body("uuid")
      .not()
      .isEmpty()
      .withMessage("UUID is required")
      .trim()
      .escape(),
    body("action")
      .not()
      .isEmpty()
      .withMessage("Action is required")
      .trim()
      .escape(),
  ],
  authController.toggleAccountState
);

module.exports = router;
