require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const User = require("./user");

const Payment = sequelize.define("payments", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  orderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  amount: {
    type: Sequelize.DOUBLE,
  },
  currencyCode: {
    type: Sequelize.STRING,
    defaultValue: process.env.NGN_CURRENCY,
  },
  option: {
    type: Sequelize.STRING,
  },
  transactionId: {
    type: Sequelize.STRING,
  },
  transactionReference: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
});

module.exports = Payment;
