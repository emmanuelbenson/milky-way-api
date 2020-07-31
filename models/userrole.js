const { Sequelize, Model } = require("sequelize");

const sequelize = require("../utils/database");

class UserRole extends Model {}
UserRole.init(
  {
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
    roleId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, modelName: "users_roles", timestamps: false }
);

module.exports = UserRole;
