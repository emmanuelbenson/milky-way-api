const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const IsAuth = require("../middlewares/is-auth");
const IsAdmin = require("../middlewares/is-admin");

const Status = require("../constants/status");
const ResponseError = require("../constants/responseErrors");
const { body } = require("express-validator");
const PasswordReset = require("../models/passwordreset");

router.post(
  "/signup",
  [
    body("password").not().isEmpty().trim().escape(),
    body("phoneNumber").not().isEmpty().trim().escape(),
    body("userType").not().isEmpty().trim().escape(),
    body("firstName").not().isEmpty().trim().escape(),
    body("lastName").not().isEmpty().trim().escape(),
  ],
  authController.signup
);

router.post(
  "/signin",
  [
    body("phoneNumber").not().isEmpty().trim().escape(),
    body("password").not().isEmpty().trim().escape(),
  ],
  authController.signin
);

router.post(
  "/reset-password",
  [
    body("phoneNumber")
      .not()
      .isEmpty()
      .withMessage("Phone Number is required")
      .trim()
      .escape(),
  ],
  authController.resetPassword
);

router.post(
  "/password-reset",
  [
    body("phoneNumber")
      .not()
      .isEmpty()
      .withMessage("Phone Number is required")
      .trim()
      .escape(),
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .trim()
      .escape(),
    body("token")
      .not()
      .isEmpty()
      .withMessage("Invalid request")
      .trim()
      .escape(),
  ],
  authController.passwordReset
);

module.exports = router;
