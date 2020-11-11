const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const isCustomer = require("../middlewares/is-customer");
const isAuth = require("../middlewares/is-auth");

const controller = require("../controllers/payment");

router.post(
  "/verify",
  isAuth,
  isCustomer,
  [
    body("paymentReference")
      .not()
      .isEmpty()
      .withMessage("paymentReference is required")
      .trim()
      .escape(),
    body("transactionId")
      .not()
      .isEmpty()
      .withMessage("transactionReference is required")
      .trim()
      .escape(),
  ],
  controller.verify
);

router.get("/:reference", isAuth, controller.get);
router.get("/:reference/status", isAuth, controller.getStatus);

module.exports = router;
