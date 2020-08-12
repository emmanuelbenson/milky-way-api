const Constants = require("../constants/Constants");

const Address = require("../models/address");
const User = require("../models/user");

exports.save = async (userId, address = []) => {
  let newAddressResponse;
  try {
    newAddressResponse = await Address.create({
      userId: userId,
      street: address.street,
      lga: address.lga,
      state: address.state,
      country: Constants.COUNTRY,
      longitude: address.longitude,
      latitude: address.latitude,
    });
  } catch (err) {
    throw err;
  }

  return newAddressResponse.dataValues.id;
};

exports.findByUserId = async (userId) => {
  let foundAddress;
  try {
    foundAddress = await Address.findOne({ where: { userId: userId } });
  } catch (err) {
    throw err;
  }
  return foundAddress;
};

exports.findByUUId = async (uuId) => {
  let foundUser;
  try {
    foundUser = await User.findOne({ where: { uuId: uuId } });
  } catch (err) {
    console.log(err);
  }

  if (!foundUser) {
    const error = new Error("Address no found");
    error.statusCode = 404;
    error.data = [];
    throw error;
  }

  const user = foundUser.dataValues;

  let foundAddress;
  try {
    foundAddress = await Address.findOne({ where: { userId: user.id } });
  } catch (err) {
    throw err;
  }
  return foundAddress;
};

exports.update = async (userId, fields = {}) => {
  let updateResponse;
  try {
    updateResponse = await Address.update(fields, {
      where: { userId: userId },
    });
  } catch (err) {
    throw err;
  }

  console.log(updateResponse);
};
