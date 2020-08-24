const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const User = require("./user");

const Request = sequelize.define("requests", {
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
  requestId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  requestServiceManager: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  requestServiceManagerMethod: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  serviceManagerMethodArrayParam: {
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

module.exports = Request;
