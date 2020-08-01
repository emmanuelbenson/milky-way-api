const { Sequelize, Model } = require("sequelize");

const sequelize = require("../utils/database");

class Profile extends Model {}
Profile.init(
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
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "profile" }
);

module.exports = Profile;
