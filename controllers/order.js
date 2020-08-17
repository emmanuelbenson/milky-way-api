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
    next(error);
  }

  if (!customer) {
    SendError.send(404, "Customer not found", customer, next);
    return;
  }

  try {
    station = await GasStationManager.find(req.body.stationId);
  } catch (err) {
    console.log(err);
    next(err);
  }

  if (!station) {
    SendError.send(404, "Gas station does not exist", station, next);
    return;
  }

  shipAddress = req.body.shipAddress
    ? req.body.shipAddress
    : JSON.stringify(customer.address);

  const order = {
    gasStationId: station.id,
    userId: req.userId,
    shipAddress: req.body.shipAddress ? req.body.shipAddress : customer.address,
    orderNumber: Generate.genOrderNumber(10),
  };

  if (!order.shipAddress) {
    SendError.send(
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

exports.listOrders = async (req, res, next) => {
  let orderList;

  try {
    orderList = await OrderManager.listAll(req.userId);
  } catch (err) {
    console.log(err);
    next(err);
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
    next(err);
  }

  const data = {};
  data.message = order ? "Order found" : "Order could not be found";
  data.data = order;

  res.status(200).json(data);
};

exports.updateOrderState = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const newState = req.body.action;
  const uuID = req.uuid;

  let user, order;

  try {
    user = await AccountManager.findByUUID(uuID);
  } catch (err) {
    console.log(err);
    next(err);
  }

  if (!user) {
    res.status(403).json({ message: "Forbidden", data: [] });
    return;
  }

  if (
    (newState === Status.PROCESSING &&
      parseInt(user.userType) !== Constants.VENDOR_TYPE) ||
    newState === Status.PENDING
  ) {
    res.status(403).json({ message: "Forbidden", data: [] });
    return;
  }

  try {
    order = await OrderManager.getOrderByID(req.body.orderId);
  } catch (err) {
    console.log(err);
    next(err);
  }

  if (!order) {
    res.status(200).json({ message: "Order not found", data: [] });
    return;
  }

  if (order && newState === order.dataValues.status) {
    res.status(200).json({ message: "Order is already " + newState, data: [] });
    return;
  }

  if (order.dataValues.status === Status.DECLINED) {
    res.status(401).json({ message: "Order have been declined", data: [] });
    return;
  }

  if (
    Status.VENDOR_SATISFIED === newState &&
    parseInt(user.userType) !== Constants.VENDOR_TYPE
  ) {
    res.status(403).json({ message: "Forbidden", data: [] });
    return;
  }

  if (
    Status.CUSTOMER_SATISFIED === newState &&
    parseInt(user.userType) !== Constants.CUSTOMER_TYPE
  ) {
    res.status(403).json({ message: "Forbidden", data: [] });
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
    next(err);
  }

  res.status(201).json({ message: "Order have been updated to " + newState });
  return;
};
