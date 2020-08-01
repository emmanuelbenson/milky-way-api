require("dotenv").config();

// const { database } = require("../config/config");
const config = require("../config/config.json");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  config.local.database,
  config.local.username,
  config.local.password,
  {
    host: config.local.host,
    port: config.local.port,
    dialect: config.local.dialect,
  }
);

module.exports = sequelize;
