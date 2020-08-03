const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const VendorService = sequelize.define("vendors_services", {
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
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  amount: {
    type: Sequelize.DECIMAL(11, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  addressId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
});

module.exports = VendorService;
