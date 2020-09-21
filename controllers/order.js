require("dotenv").config();
const { validationResult } = require("express-validator");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const responseSuccess = require("../constants/responseSuccess");
const Error = require("../utils/errors");
const ValidateInputs = require("../utils/validateInputs");
const Generate = require("../utils/generate");

const CustomerManager = require("../services/customerManager");
const OrderManager = require("../services/orderManager");
const GasStationManager = require("../services/gasStationManager");
const AccountManager = require("../services/accountManager");
const Order = require("../models/order");

exports.placeOrder = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  let customer, station, shipAddress;

  try {
    customer = await CustomerManager.getDetails(req.userId);
  } catch (error) {
    console.log(error);
    return Error.send(500, "Internal server error", [], next);
  }

  if (!customer) {
    return Error.send(404, "Customer not found", [], next);
    return;
  }

  try {
    station = await GasStationManager.find(req.body.stationId);
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  if (!station) {
    return Error.send(404, "Gas station does not exist", [], next);
  }

  shipAddress = req.body.shipAddress
    ? req.body.shipAddress
    : JSON.stringify(customer.address);

  const order = {
    gasStationId: station.id,
    userId: req.userId,
    shipAddress: shipAddress,
    orderNumber: Generate.orderNumber(10),
  };

  if (!order.shipAddress) {
    return Error.send(
      404,
      "You don't seem to have an address. Please specify your shipping address",
      [],
      next
    );
    return;
  }

  const orderDetails = {
    orderId: null,
    amountPerKg: station.dataValues.amount,
    totalAmount: station.dataValues.amount * req.body.quantity,
    quantityInKg: req.body.quantity,
  };

  let createOrderResponse;
  try {
    createOrderResponse = await OrderManager.create(order, orderDetails);
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
    return;
  }

  const data = {
    message: "Order placed",
    data: createOrderResponse,
  };

  res.status(201).json(data);
};

exports.listOrders = async (req, res, next) => {
  let orderList;

  try {
    orderList = await OrderManager.listAll(req.userId);
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  res.status(200).json(orderList);
};

exports.viewOrder = async (req, res, next) => {
  const orderNumber = req.params.orderNumber;

  let order;

  try {
    order = await OrderManager.getOrderByOrderNumber(req.userId, orderNumber);
  } catch (err) {
    console.log(err);
    return Error.send(err.statusCode, err.message, err.data, next);
  }

  const data = {};
  order.message = order ? "Order found" : "Order not found";
  // data.order = order;

  res.status(200).json(order);
};

exports.updateOrderState = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const validActions = [
    Status.CANCELLED,
    Status.COMPLETED,
    Status.CUSTOMER_SATISFIED,
    Status.DECLINED,
    Status.PROCESSING,
    Status.VENDOR_SATISFIED,
  ];

  const newState = req.body.action;
  const uuID = req.uuid;

  let user, order;

  try {
    user = await AccountManager.findByUUID(uuID);
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  if (!user) {
    return Error.send(403, "Forbidden", [], next);
    return;
  }

  if (
    (newState === Status.PROCESSING &&
      parseInt(user.userType) !== Constants.VENDOR_TYPE) ||
    newState === Status.PENDING
  ) {
    return Error.send(403, "Forbidden", [], next);
    return;
  }

  if (!validActions.includes(req.body.action)) {
    return Error.send(403, "Invalid action", [], next);
  }

  try {
    order = await OrderManager.getOrderByID(req.body.orderId);
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  console.log("ORDER: ", order);

  if (!order) {
    return Error.send(404, "Order not found", [], next);
    return;
  }

  if (order && newState === order.dataValues.status) {
    return Error.send(200, "Order is already " + newState, [], next);
    return;
  }

  if (order.dataValues.status === Status.DECLINED) {
    return Error.send(401, "Order have been declined", [], next);
    return;
  }

  if (
    Status.VENDOR_SATISFIED === newState &&
    parseInt(user.userType) !== Constants.VENDOR_TYPE
  ) {
    return Error.send(403, "Forbidden", [], next);
    return;
  }

  if (
    Status.CUSTOMER_SATISFIED === newState &&
    parseInt(user.userType) !== Constants.CUSTOMER_TYPE
  ) {
    return Error.send(403, "Forbidden", [], next);
    return;
  }

  let updateResponse;

  try {
    updateResponse = await OrderManager.updateOrderStatus(
      order.dataValues.id,
      newState
    );
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  res.status(201).json({ message: "Order have been updated to " + newState });
  return;
};
