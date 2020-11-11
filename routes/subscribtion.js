const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const isAuth = require("../middlewares/is-auth");
const isVendor = require("../middlewares/is-vendor");
const controller = require("../controllers/subscription");

router.post(
  "/",
  isAuth,
  isVendor,
  [
    body("paymentRef")
      .not()
      .isEmpty()
      .withMessage("payment reference is required"),
  ],
  controller.subscribe
);

router.get("/", isAuth, isVendor, controller.getSubscription);

module.exports = router;
