const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Vendor = require("./user");

const OTP = sequelize.define("otps", {
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
  expiresIn: {
    type: Sequelize.DATE,
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

module.exports = OTP;
