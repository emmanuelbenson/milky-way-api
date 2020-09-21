const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const User = require("./user");

const VendorRating = sequelize.define("vendor_ratings", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  customerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  vendorId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  orderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  rating: {
    type: Sequelize.DOUBLE,
    defaultValue: 1,
  },
  comment: {
    type: Sequelize.TEXT,
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

module.exports = VendorRating;
