const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const TransactionLimit = sequelize.define("transaction_limits", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  transactionType: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  period: {
    type: Sequelize.ENUM,
    values: ["daily", "weekly", "monthly", "quarterly", "yearly"],
    defaultValue: "daily",
  },
  limit: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 1,
  },
  status: {
    type: Sequelize.ENUM,
    values: ["enabled", "disabled"],
    defaultValue: "enabled",
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

module.exports = TransactionLimit;
