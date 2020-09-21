const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Subscription = sequelize.define("subscriptions", {
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
  expiryDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  expired: {
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

module.exports = Subscription;
