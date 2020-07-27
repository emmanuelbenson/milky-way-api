const { Sequelize, Model } = require("sequelize");

const sequelize = require("../utils/database");

class Profile extends Model {}
Profile.init(
  {
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
