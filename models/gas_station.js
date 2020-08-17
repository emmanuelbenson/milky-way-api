const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const GasStation = sequelize.define("gas_stations", {
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
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  amount: {
    type: Sequelize.DECIMAL(11, 2),
    defaultValue: 0.0,
  },
  measureUnit: {
    type: Sequelize.STRING,
    defaultValue: "Kg",
  },
  geometry: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING,
    defaultValue: "Feature",
  },
  properties: {
    type: Sequelize.TEXT,
    defaultValue: "Feature",
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

module.exports = GasStation;
