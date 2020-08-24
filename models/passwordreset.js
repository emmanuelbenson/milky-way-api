"use strict";
const { Sequelize, Model } = require("sequelize");

const sequelize = require("../utils/database");
const Status = require("../constants/status");

class PasswordReset extends Model {}
PasswordReset.init(
  {
    email: {
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
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: Status.UNEXPIRED,
    },
  },
  { sequelize, modelName: "password_reset" }
);

module.exports = PasswordReset;
