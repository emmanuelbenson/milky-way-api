const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const addressController = require("../controllers/address");
const isAuth = require("../middlewares/is-auth");
const isCustomer = require("../middlewares/is-customer");

router.post(
  "/",
  isAuth,
  isCustomer,
  [
    body("street")
      .not()
      .isEmpty()
      .withMessage("street field is required")
      .trim()
      .escape(),
    body("lga")
      .not()
      .isEmpty()
      .withMessage("lga field is required")
      .trim()
      .escape(),
    body("state")
      .not()
      .isEmpty()
      .withMessage("state field is required")
      .trim()
      .escape(),
    body("lng")
      .not()
      .isEmpty()
      .withMessage("longitude field is required")
      .trim()
      .escape(),
    body("lat")
      .not()
      .isEmpty()
      .withMessage("latitude field is required")
      .trim()
      .escape(),
  ],
  addressController.add
);

router.post(
  "/update",
  isAuth,
  isCustomer,
  [
    body("userId")
      .not()
      .isEmpty()
      .withMessage("user ID required")
      .trim()
      .escape(),
  ],
  addressController.update
);

router.get("/search", isAuth, isCustomer, addressController.find);

module.exports = router;
