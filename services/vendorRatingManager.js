const VendorRating = require("../models/vendorRating");

const Status = require("../constants/status");
const { Op } = require("sequelize");

exports.rate = async (customerId, vendorId, orderId, rating, comment) => {
  try {
    await VendorRating.create({
      customerId: customerId,
      vendorId: vendorId,
      orderId: orderId,
      rating: rating,
      comment: comment,
    });
  } catch (err) {
    throw err;
  }

  return true;
};

exports.getById = async (id) => {
  let rating;

  try {
    rating = await VendorRating.findOne({
      where: { id: id },
    });
  } catch (err) {
    throw err;
  }

  return rating;
};

// Retrieves customers ratings for a vendor
exports.getCustomersRatings = async (vendorId) => {
  let rating;

  try {
    rating = await VendorRating.findAll({
      where: {
        vendorId: vendorId,
      },
    });
  } catch (err) {
    throw err;
  }

  return rating;
};

exports.getRatingByCustomerVendorAndOrderId = async (
  customerId,
  vendorId,
  orderId
) => {
  let rating;

  try {
    rating = await VendorRating.findAll({
      where: {
        [Op.and]: [
          { customerId: customerId },
          { vendorId: vendorId },
          { orderId: orderId },
        ],
      },
    });
  } catch (err) {
    throw err;
  }

  return rating;
};

// For a specific custsomer or vendor
exports.getRatingsForCustomerOrVendor = async (userId) => {
  let rating;

  try {
    rating = await VendorRating.findAll({
      where: {
        [Op.or]: [{ customerId: userId }, { vendorId: userId }],
      },
    });
  } catch (err) {
    throw err;
  }

  return rating;
};

// For Admin
exports.getRatings = async () => {
  let ratings;

  try {
    ratings = VendorRating.findAll();
  } catch (err) {
    throw err;
  }

  return ratings;
};

exports.updateStatus = async (id, newStatus) => {
  let response;
  try {
    response = await VendorRating.update(
      { status: newStatus },
      { where: { id: id } }
    );
  } catch (err) {
    throw err;
  }

  return response;
};
