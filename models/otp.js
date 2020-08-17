const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Vendor = require("./user");

const Product = sequelize.define("product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  requestId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  otp: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  used: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
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

module.exports = Product;
