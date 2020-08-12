const express = require("express");
const router = express.Router();

const { validationResult, body } = require("express-validator");

const orderController = require("../controllers/order");
const isAuth = require("../middlewares/is-auth");
const isCustomer = require("../middlewares/is-customer");

router.post(
  "/create",
  isAuth,
  isCustomer,
  [
    body("productId")
      .not()
      .isEmpty()
      .withMessage("Product ID is required")
      .isInt(),
    body("quantity")
      .not()
      .isEmpty()
      .withMessage("Quantity is required")
      .isInt(),
  ],
  orderController.placeOrder
);

// router.get(
//   "/view/:orderNumber",
//   isAuth,
//   isCustomer,
//   orderController.viewOrder
// );

module.exports = router;
