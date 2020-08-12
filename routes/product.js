const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const productController = require("../controllers/product");
const isAuth = require("../middlewares/is-auth");
const isVendor = require("../middlewares/is-vendor");

router.post(
  "/create",
  isAuth,
  isVendor,
  [body("name").exists(), body("price").exists().isDecimal()],
  productController.create
);

router.post(
  "/update",
  isAuth,
  isVendor,
  [
    body("productId")
      .not()
      .isEmpty()
      .withMessage("product ID is required")
      .trim()
      .escape(),
  ],
  productController.update
);

module.exports = router;
