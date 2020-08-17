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
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  endPoint: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  endPointSource: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  ipAddress: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userAgent: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  requestBody: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  responseBody: {
    type: Sequelize.STRING,
    allowNull: false,
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
