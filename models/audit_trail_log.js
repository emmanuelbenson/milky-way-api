const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const AuditTrailLog = sequelize.define("audit_trail_logs", {
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
  actionType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  endPoint: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  endPointSource: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  ipAddress: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userAgent: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  requestBody: {
    type: Sequelize.STRING,
  },
  responseBody: {
    type: Sequelize.STRING,
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

module.exports = AuditTrailLog;
