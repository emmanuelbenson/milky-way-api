const { Sequelize } = require("sequelize");

const sequelize = require("../utils/database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  uuid: {
    type: Sequelize.UUID,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userType: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  activationCode: {
    type: Sequelize.STRING,
  },
  activated: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = User;
