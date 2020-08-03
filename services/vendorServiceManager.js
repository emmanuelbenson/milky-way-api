const Address = require("../models/address");
const VendorService = require("../models/vendorservice");

exports.register = async (userId, serviceObj = {}) => {
  let createResponse;
  try {
    createResponse = await VendorService.create({
      userId: serviceObj.userId,
      title: serviceObj.title,
      amount: serviceObj.amount,
      addressId: serviceObj.addressId,
    });
  } catch (err) {
    throw err;
  }

  return createResponse.dataValues.id;
};

exports.findByIDAndUserID = async (serviceId, userId) => {
  let foundVendorService;
  try {
    foundVendorService = await VendorService.findOne({
      where: { id: serviceId, userId: userId },
    });
  } catch (err) {
    throw err;
  }
  return foundVendorService;
};

exports.updateService = async (vendorService) => {
  let updateResponse;
  try {
    updateResponse = await vendorService.save();
  } catch (err) {
    throw err;
  }
  return updateResponse.dataValues.id;
};
