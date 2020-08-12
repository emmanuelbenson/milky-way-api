const { Sequelize } = require("sequelize");

const sequelize = require("../utils/database");

const Profile = require("./profile");
const Address = require("./address");
const Product = require("./product");

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
  phoneNumber: {
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

User.hasOne(Profile);
User.hasOne(Address);
User.hasOne(Product);

Profile.belongsTo(User);
Address.belongsTo(User);
Product.belongsTo(User);

module.exports = User;
