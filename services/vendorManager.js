const Constants = require("../constants/Constants");
const Status = require("../constants/status");
const User = require("../models/user");
const AccountManager = require("./accountManager");
const Transaction = require("../models/order");
const GasStationManager = require("../services/gasStationManager");

exports.find = async (id) => {
  const foundVendor = await User.findOne({
    where: {
      id: id,
      userType: Constants.VENDOR_TYPE,
      activated: Constants.ACTIVATE,
    },
  });

  if (foundVendor) {
    delete foundVendor.dataValues.password;
    let profile;
    let vendor;

    profile = await foundVendor.getProfile();
    address = await foundVendor.getAddress();

    vendor = foundVendor.dataValues;
    const profileData = profile ? profile.dataValues : null;
    const addressData = address ? address.dataValues : null;

    vendor.profile = profileData;
    vendor.address = addressData;

    return vendor;
  } else {
    return null;
  }
};

exports.getTransactions = async (userId) => {
  let gasStation;
  let orders;

  try {
    gasStation = await GasStationManager.findByUserId(userId);
    if (!gasStation) {
      const error = new Error("Gas Station not found");
      error.statusCode = 404;
      error.message = "Gas Station not found";
      error.data = [];
      throw error;
    }
  } catch (error) {
    throw error;
  }

  try {
    orders = await gasStation.getOrders();
  } catch (error) {
    console.log(error);
    throw error;
  }

  return orders;
};
