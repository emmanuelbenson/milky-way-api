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
    body("stationId").not().isEmpty().withMessage("Gas Station ID is required"),
    body("quantity").not().isEmpty().withMessage("Quantity is required"),
  ],
  orderController.placeOrder
);

router.get("/list", isAuth, orderController.listOrders);

router.get("/view/:orderNumber", isAuth, orderController.viewOrder);

router.post(
  "/update",
  isAuth,
  [
    body("action")
      .not()
      .isEmpty()
      .withMessage("action required")
      .trim()
      .escape(),
    body("orderId")
      .not()
      .isEmpty()
      .withMessage("Order ID is required")
      .trim()
      .escape(),
  ],
  orderController.updateOrderState
);

module.exports = router;
