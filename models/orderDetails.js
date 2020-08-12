const Sequelize = require("sequelize");

const sequelize = require("../utils/database");
const User = require("./user");

const OrderDetail = sequelize.define(
  "order_detail",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    orderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    productId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    amountPerKg: {
      type: Sequelize.DECIMAL(11, 2),
      allowNull: false,
    },
    quantityInKg: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = OrderDetail;
