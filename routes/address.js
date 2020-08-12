const express = require("express");
const router = express.Router();

const { validationResult, body } = require("express-validator");

const addressController = require("../controllers/address");
const isAuth = require("../middlewares/is-auth");

router.post(
  "/",
  isAuth,
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

router.get("/search", isAuth, addressController.find);

module.exports = router;
