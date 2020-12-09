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
  token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expiresIn: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  createResponse: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  verifyResponse: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  provider: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  action: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM,
    values: ["pending", "approved", "expired", "used", "invalid"],
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

module.exports = OTPLog;
