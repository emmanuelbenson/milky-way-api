const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const User = require("./user");

const SystemRating = sequelize.define("system_ratings", {
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
  rating: {
    type: Sequelize.DOUBLE,
    defaultValue: 1,
  },
  comment: {
    type: Sequelize.TEXT,
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
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

module.exports = SystemRating;
