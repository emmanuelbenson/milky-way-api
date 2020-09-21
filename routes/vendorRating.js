const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const isAuth = require("../middlewares/is-auth");
const isAdmin = require("../middlewares/is-admin");
const isVendor = require("../middlewares/is-vendor");
const isCustomer = require("../middlewares/is-customer");
const controller = require("../controllers/vendorRating");

router.post(
  "/",
  isAuth,
  isCustomer,
  [
    body("vendorId").not().isEmpty().withMessage("vendorId is required"),
    body("orderId").not().isEmpty().withMessage("orderId is required"),
    body("rating").not().isEmpty().withMessage("rating is required"),
    body("comment")
      .not()
      .isEmpty()
      .withMessage("comment is required")
      .trim()
      .escape()
      .isLength({ min: 10, max: 150 })
      .withMessage(
        "comment cannot be less than 10 or more than 150 characters"
      ),
  ],
  controller.addRating
);

router.post(
  "/all",
  isAuth,
  [body("vendorId").not().isEmpty().withMessage("vendorId is required")],
  controller.getCustomersRatings
);

module.exports = router;
