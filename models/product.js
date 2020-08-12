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
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  unitPrice: {
    type: Sequelize.DECIMAL(11, 2),
    defaultValue: 0.0,
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: 0,
  },
});

module.exports = Product;
