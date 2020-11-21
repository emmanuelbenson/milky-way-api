const { Sequelize } = require("sequelize");

const sequelize = require("../utils/database");

const Profile = require("./profile");
const GasStation = require("./gas_station");
const Address = require("./address");
const VendorRating = require("./vendorRating");
const Subscription = require("./subscription");
const AuditTrail = require("./audit_trail_log");

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
    allowNull: true,
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
User.hasOne(GasStation);
User.hasOne(Address);

Profile.belongsTo(User);
GasStation.belongsTo(User);
Address.belongsTo(User);

User.hasMany(VendorRating, {
  foreignKey: "customerId",
});

User.hasOne(Subscription);
Subscription.belongsTo(User);

User.hasMany(AuditTrail);
AuditTrail.belongsTo(User);

module.exports = User;
