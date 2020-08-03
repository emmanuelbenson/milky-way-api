const express = require("express");
const router = express.Router();

const { validationResult, body } = require("express-validator");

const serviceController = require("../controllers/vendor");
const isAuth = require("../middlewares/is-auth");
const isVendor = require("../middlewares/is-vendor");

router.post(
  "/service/register",
  isAuth,
  [
    body("title")
      .not()
      .isEmpty()
      .withMessage("service title is required")
      .trim()
      .escape(),
    body("amount")
      .not()
      .isEmpty()
      .withMessage("service amount/kg is required")
      .trim()
      .escape(),
  ],
  serviceController.registerService
);

router.post("/service/update", isAuth, serviceController.updateService);

module.exports = router;
