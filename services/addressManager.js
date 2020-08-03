const Constants = require("../constants/Constants");

const Address = require("../models/address");

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
