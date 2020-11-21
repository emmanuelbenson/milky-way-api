const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const controller = require("../controllers/otp");

router.post(
  "/send",
  [body("phoneNumber").not().isEmpty().withMessage("rating required")],
  controller.send
);

router.post(
  "/verify",
  [
    body("phoneNumber")
      .not()
      .isEmpty()
      .withMessage("phone number is required")
      .trim()
      .escape(),
    body("token").not().isEmpty().withMessage("token is required").escape(),
    body("tokenId").not().isEmpty().withMessage("tokenId is required").escape(),
  ],
  controller.very
);

module.exports = router;
