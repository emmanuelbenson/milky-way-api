const express = require("express");
const router = express.Router();

const User = require("../models/user");
const authController = require("../controllers/auth");

const { body, validatorResult } = require("express-validator");

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
  ],
  authController.signup
);

module.exports = router;
