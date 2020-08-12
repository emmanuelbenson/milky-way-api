const Sequelize = require("sequelize");

const sequelize = require("../utils/database");
const OrderDetail = require("./orderDetails");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  vendorId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  customerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  isPaid: {
    type: Sequelize.INTEGER,

    defaultValue: false,
  },
  orderNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  shipAddress: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  status: {
    type: Sequelize.TEXT,
    defaultValue: "pending",
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

Order.hasOne(OrderDetail);
OrderDetail.belongsTo(Order);

module.exports = Order;
