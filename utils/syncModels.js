const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const User = require("../models/user");
const Address = require("../models/address");
const Profile = require("../models/profile");

exports.ModelSyncer = () => {
  Address.belongsTo(User);
  Profile.belongsTo(User);
  User.hasOne(Profile, { onDelete: "CASCADE" });
  User.hasOne(Address, { onDelete: "CASCADE" });
  return sequelize;
};
