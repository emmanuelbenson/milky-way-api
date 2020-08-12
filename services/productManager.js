const Address = require("../models/address");
const Product = require("../models/product");

exports.create = async (productObj = {}) => {
  let createResponse;
  try {
    createResponse = await Product.create({
      userId: productObj.userId,
      name: productObj.name,
      unitPrice: productObj.price,
    });
  } catch (err) {
    throw err;
  }

  return createResponse.dataValues.id;
};

exports.find = async (productId) => {
  let foundVendorProduct;
  try {
    foundVendorProduct = await Product.findOne({
      where: { id: productId },
    });
  } catch (err) {
    throw err;
  }

  return foundVendorProduct ? foundVendorProduct.dataValues : null;
};

exports.findByVendorID = async (vendorId) => {
  let foundVendorProduct;
  try {
    foundVendorProduct = await Product.findOne({
      where: { userId: vendorId },
    });
  } catch (err) {
    throw err;
  }
  return foundVendorProduct;
};

exports.updateProduct = async (vendorId, productId, fields = {}) => {
  let updateResponse;

  try {
    updateResponse = await Product.update(fields, {
      where: { userId: vendorId, id: productId },
    });
  } catch (err) {
    throw err;
  }

  return updateResponse;
};
