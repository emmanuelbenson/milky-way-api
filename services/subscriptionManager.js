const Subscription = require("../models/subscription");
const AccountManager = require("../services/accountManager");

const ExpirationDate = require("../utils/timestampExpiration");

const moment = require("moment");
const User = require("../models/user");
const Profile = require("../models/profile");

exports.subscribe = async (userId) => {
  let expiryDate = moment().add(12, "months").toLocaleString();
  console.log("EXP_DATE: ", expiryDate);

  try {
    await Subscription.create({
      userId,
      expiryDate,
    });
  } catch (err) {
    throw err;
  }
  return expiryDate;
};

exports.isSubscribed = async (userId) => {
  let subscriber, error;

  try {
    subscriber = await this.getSubscription(userId);
  } catch (error) {
    throw error;
  }

  if (!subscriber) return false;

  return ExpirationDate.check(subscriber.dataValues.expiryDate);
};

exports.isExpired = async (userId) => {
  let subscriber, error;

  try {
    subscriber = await this.getSubscriber(userId);
  } catch (error) {
    throw error;
  }

  if (!subscriber) {
    error = new Error("You have not subscribed");
    error.statusCode = 404;
    error.data = [];
    throw error;
  }

  return ExpirationDate.check(subscriber.dataValues.expiryDate);
};

exports.getSubscription = async (userId) => {
  let subscription;

  try {
    subscription = await Subscription.findOne({
      include: {
        model: User,
        attributes: ["id", "uuid", "email", "phoneNumber"],
        include: { model: Profile, attributes: ["firstName", "lastName"] },
      },
      where: { userId },
      attributes: ["id", "userId", "expiryDate", "expired", "createdAt"],
    });
  } catch (error) {
    throw error;
  }

  return subscription;
};

exports.getSubscribers = async () => {
  let subscribers;

  try {
    subscribers = await Subscription.findAll();
  } catch (error) {
    throw error;
  }

  return subscribers;
};
