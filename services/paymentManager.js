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
  let payment;

  try {
    payment = await this.get(userId, transactionRef);
  } catch (error) {
    throw error;
  }

  if (payment) {
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

    if (verifyResponse.status === Status.OK) {
      let order;

      try {
        order = await payment.getOrder();
      } catch (error) {
        console.log(error);
        throw error;
      }

      const data = verifyResponse.data;

      if (
        data.charged_amount === order.amount &&
        data.tx_ref === transactionRef &&
        data.status === Status.SUCCESSFUL
      ) {
        try {
          await payment.update({
            where: { option: data.payment_type, status: data.status },
          });
        } catch (error) {
          console.log(error);
          throw error;
        }
      } else {
        const error = new Error("Invalid payment");
        error.message = "Invalid payment";
        error.statusCode = 404;
        error.data = [];
        throw error;
      }
    } else {
      try {
        await payment.update({ status: data.status });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  } else {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    error.data = [];
    throw error;
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
