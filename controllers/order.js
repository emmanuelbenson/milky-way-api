require("dotenv").config();
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
const Errors = require("../libs/errors/errors");
const UtilError = require("../utils/errors");
const { validationResult } = require("express-validator");

exports.placeOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new Errors.UnprocessableEntity(errors));
    return;
  }

  let customer, station, shipAddress;

  try {
    customer = await CustomerManager.getDetails(req.userId);
  } catch (error) {
    console.log(error);
    next(new Errors.GeneralError());
    return;
  }

  if (!customer) {
    next(
      new Errors.NotFound(
        UtilError.parse(null, "Customer not found", null, null)
      )
    );
    return;
  }

  try {
    station = await GasStationManager.find(req.body.stationId);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (!station) {
    next(
      new Errors.NotFound(
        UtilError.parse(null, "Gas station does not exist", null, null)
      )
    );
    return;
  }

  if (!req.body.shipAddress && !customer.address) {
    next(
      new Errors.NotFound(
        UtilError.parse(null, "No shipping address found", null, null)
      )
    );
    return;
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
    next(
      new Errors.NotFound(
        UtilError.parse(
          null,
          "You don't seem to have an address. Please specify your shipping address",
          null,
          null
        )
      )
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
    next(new Errors.GeneralError());
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
    next(new Errors.GeneralError());
    return;
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
    next(new Errors.GeneralError());
    return;
  }

  order.message = order ? "Order found" : "Order not found";

  res.status(200).json(order);
};

exports.updateOrderState = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new Errors.UnprocessableEntity(errors));
    return;
  }

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
    next(new Errors.GeneralError());
    return;
  }

  if (!user) {
    next(new Errors.Forbidden(UtilError.parse(null, "Forbidden", null, null)));
    return;
  }

  if (
    (newState === Status.PROCESSING &&
      parseInt(user.userType) !== Constants.VENDOR_TYPE) ||
    newState === Status.PENDING
  ) {
    next(new Errors.Forbidden(UtilError.parse(null, "Forbidden", null, null)));
    return;
  }

  if (!validActions.includes(req.body.action)) {
    next(
      new Errors.Forbidden(UtilError.parse(null, "Invalid action", null, null))
    );
    return;
  }

  try {
    order = await OrderManager.getOrderByID(req.body.orderId);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (!order) {
    next(
      new Errors.NotFound(UtilError.parse(null, "Order not found", null, null))
    );
    return;
  }

  if (order && newState === order.dataValues.status) {
    next(
      new Errors.Forbidden(
        UtilError.parse(null, "Order is already " + newState, null, null)
      )
    );
    return;
  }

  if (order.dataValues.status === Status.DECLINED) {
    next(
      new Errors.Forbidden(
        UtilError.parse(null, "Order have been declined", null, null)
      )
    );
    return;
  }

  if (
    Status.VENDOR_SATISFIED === newState &&
    parseInt(user.userType) !== Constants.VENDOR_TYPE
  ) {
    next(new Errors.Forbidden(UtilError.parse(null, "Forbidden", null, null)));
    return;
  }

  if (
    Status.CUSTOMER_SATISFIED === newState &&
    parseInt(user.userType) !== Constants.CUSTOMER_TYPE
  ) {
    next(new Errors.Forbidden(UtilError.parse(null, "Forbidden", null, null)));
    return;
  }

  try {
    await OrderManager.updateOrderStatus(order.dataValues.id, newState);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  res.status(201).json({ message: "Order have been updated to " + newState });
  return;
};
