require("dotenv").config();
const config = require("../config/config.json");
const Status = require("../constants/status");

const Axios = require("axios").default;

const OrderManager = require("../services/orderManager");
const Payment = require("../models/payment");
const { Op } = require("sequelize");

exports.getPublicKey = () => {
  const pubKey = process.env.PAYMENT_FLUTTERWAVE_PUBLIC_KEY;

  return pubKey;
};

exports.initiate = async (
  userId,
  orderId,
  transactionReference = "ORD_REF",
  amount = 0.0,
  customer = {}
) => {
  let requestObject = {};

  requestObject.customer = customer;
  requestObject.tx_ref = transactionReference;
  requestObject.amount = amount;
  requestObject.currency = config.payment.CURRENCY;
  requestObject.redirect_url = process.env.FLUTTERWAVE_WEB_HOOK;
  requestObject.payment_options = config.payment.flutterwave.options.CARD;
  requestObject.customizations = {
    title: "GOS Payments",
    description: "",
    logo: "",
  };

  let payment;

  try {
    payment = await Payment.create({
      userId,
      orderId,
      transactionReference,
      transactionId: null,
      amount,
      currencyCode: null,
      option: null,
    });
  } catch (error) {
    throw error;
  }

  let initiateResponse;
  let url =
    process.env.FLUTTERWAVE_BASE_URL + config.payment.flutterwave.ENDPOINT;

  try {
    initiateResponse = await Axios.post(url, requestObject, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_PRIVATE_KEY}`,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  return initiateResponse;
};

exports.hook = async (transactionReference, transactionId) => {
  let payment;

  try {
    payment = await Payment.findOne({
      where: { transactionReference },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  if (payment) {
    try {
      await payment.update({ transactionId });
    } catch (error) {
      console.log(error);
      throw error;
    }
    return true;
  }
  const error = new Error("Not found");
  error.statusCode = 404;
  error.data = [];
  throw error;
};

exports.verify = async (userId, transactionRef, transactionId) => {
  let payment, error;

  try {
    payment = await this.get(userId, transactionRef);
  } catch (err) {
    throw err;
  }

  if (!payment) {
    const msg = "Payment not found";
    error = new Error(msg);
    error.statusCode = 404;
    error.message = msg;
    error.data = [];
    throw error;
  }

  if (payment.dataValues.status === Status.PENDING) {
    let verifyResponse;
    let url =
      process.env.FLUTTERWAVE_BASE_URL +
      config.payment.flutterwave.VERIFY_ENDPOINT +
      "/" +
      transactionId +
      "/verify";

    try {
      verifyResponse = await Axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FLUTTERWAVE_PRIVATE_KEY}`,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    if (verifyResponse.status !== Status.OK) {
      const msg = "Payment verification failed";
      const error = new Error(msg);
      error.statusCode = 404;
      error.data = [];
      console.log(verifyResponse);
      throw error;
    }

    let order, orderDetails;

    try {
      order = await payment.getOrder();
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      orderDetails = await OrderManager.getOrderDetailsByOrderId(
        order.dataValues.id
      );
    } catch (error) {
      throw error;
    }

    const data = verifyResponse.data.data;
    order = order.dataValues;
    orderDetails = orderDetails.dataValues;

    let newStatus = payment.dataValues.status;
    newStatus =
      data.amount !== parseInt(orderDetails.totalAmount)
        ? Status.FAILED
        : data.status;
    console.log(newStatus, data.status);

    try {
      await payment.update({
        option: data.payment_type,
        currencyCode: data.currency,
        status: newStatus,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
    return payment;
  } else {
    return payment;
  }
};

exports.get = async (userId, transactionReference) => {
  let payment;

  try {
    payment = await Payment.findOne({
      where: { [Op.and]: [{ userId }, { transactionReference }] },
    });
  } catch (error) {
    throw error;
  }

  return payment;
};
