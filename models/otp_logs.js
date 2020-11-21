const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const OTPLog = sequelize.define("otp_logs", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  phoneNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  createResponse: {
    type: Sequelize.TEXT,
  },
  verifyResponse: {
    type: Sequelize.TEXT,
  },
  provider: {
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
  action: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.ENUM,
    values: ["pending", "approved", "expired", "used"],
  },
});

module.exports = OTPLog;
