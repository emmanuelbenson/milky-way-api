const Status = require("../constants/status");
const Error = require("../utils/errors");
const ValidateInputs = require("../utils/validateInputs");

const SubManager = require("../services/subscriptionManager");

exports.subscribe = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const userId = req.userId;
  const { paymentRef } = req.body;

  let isSubscribed = false;

  try {
    isSubscribed = await SubManager.isSubscribed(userId);
  } catch (error) {
    console.log(error);
    throw error;
  }

  if (isSubscribed) {
    return res.status(403).json({
      message: "You are already subscribed",
    });
  }

  let expiryDate;
  try {
    expiryDate = await SubManager.subscribe(userId);
  } catch (error) {
    console.log(error);
    throw error;
  }

  res.status(200).json({
    message: `You have been subscribed. Your subscription will be valid till ${expiryDate}`,
  });
};

exports.getSubscription = async (req, res, next) => {
  const userId = req.userId;

  let subscription;

  try {
    subscription = await SubManager.getSubscription(userId);
  } catch (error) {
    console.log(error);
    throw error;
  }

  res.status(200).json(subscription);
};
