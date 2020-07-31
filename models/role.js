const { Sequelize, Model } = require("sequelize");

const sequelize = require("../utils/database");

class Role extends Model {}
Profile.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
  },
  { sequelize, modelName: "roles", timestamps: false }
);

module.exports = Role;
