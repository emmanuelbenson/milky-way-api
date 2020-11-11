const Sequelize = require("sequelize");

const sequelize = require("../utils/database");
const OrderDetails = require("./orderDetails");
const Payment = require("./payment");
const GasStation = require("./gas_station");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  gasStationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
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

Order.hasOne(OrderDetails);
OrderDetails.belongsTo(Order);

Order.hasOne(Payment);
Payment.belongsTo(Order);

Order.belongsTo(GasStation);
GasStation.hasMany(Order);

module.exports = Order;
