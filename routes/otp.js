const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const controller = require("../controllers/otp");

router.get("/action-types", controller.getActionTypes);

router.post(
  "/resend",
  [
    body("phoneNumber")
      .not()
      .isEmpty()
      .withMessage("Phone Number is required")
      .trim()
      .escape(),
    body("actionType")
      .not()
      .isEmpty()
      .withMessage("OTP Action Type is required")
      .trim()
      .escape(),
  ],
  controller.resend
);

router.post(
  "/verify",
  [
    body("phoneNumber")
      .not()
      .isEmpty()
      .withMessage("Phone Number is required")
      .trim()
      .escape(),
    body("token").not().isEmpty().withMessage("Token is required").escape(),
    body("actionType").not().isEmpty().withMessage("OTP Action Type is required").escape(),
  ],
  controller.very
);

module.exports = router;
