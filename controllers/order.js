require("dotenv").config();
const { validationResult } = require("express-validator");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const responseSuccess = require("../constants/responseSuccess");
const SendError = require("../utils/errors");
const ValidateInputs = require("../utils/validateInputs");
const Generate = require("../utils/generate");

const VendorManager = require("../services/vendorManager");
const CustomerManager = require("../services/customerManager");
const OrderManager = require("../services/orderManager");
const ProductManager = require("../services/productManager");

exports.placeOrder = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  let customer, product, vendor;

  try {
    customer = await CustomerManager.getDetails(req.userId);
    product = await ProductManager.find(req.body.productId);
  } catch (error) {
    next(error);
  }

  if (!customer) {
    SendError.send(404, "Customer not found", customer, next);
  }

  if (!product) {
    SendError.send(404, "Product not found", [], next);
  }

  try {
    vendor = await VendorManager.find(product.userId);
  } catch (error) {
    next(error);
  }

  if (!vendor) {
    SendError.send(404, "Product not found", [], next);
  }

  const customerAddress = JSON.stringify({
    street: customer.address.street,
    lga: customer.address.lga,
    state: customer.address.state,
    country: customer.address.country,
  });

  const order = {
    vendorId: vendor.id,
    customerId: req.userId,
    shipAddress: req.body.shipAddress ? req.body.shipAddress : customerAddress,
    orderNumber: Generate.randomString(10),
  };

  const orderDetails = {
    orderId: null,
    productId: product.id,
    amountPerKg: product.unitPrice,
    quantityInKg: req.body.quantity,
  };

  let createOrderResponse;
  try {
    createOrderResponse = await OrderManager.create(order, orderDetails);
  } catch (err) {
    next(err);
    return;
  }

  const data = {
    message: "Order placed",
    data: [
      {
        status: createOrderResponse.status,
        orderNumber: createOrderResponse.orderNumber,
        createdAt: createOrderResponse.createdAt,
      },
    ],
  };

  res.status(201).json(data);
};
