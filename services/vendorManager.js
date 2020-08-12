const Vendor = require("../models/user");
const Constants = require("../constants/Constants");
const Status = require("../constants/status");
const Product = require("../models/product");
const User = require("../models/user");

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

exports.findByProductId = async (productId) => {
  const foundProduct = await Product.findOne({
    where: {
      id: productId,
    },
  });

  if (foundProduct) {
    let vendor;

    vendor = foundProduct.getUser();

    return vendor;
  } else {
    return null;
  }
};

exports.getProduct = async (id) => {
  const foundVendor = await User.findOne({
    where: {
      id: id,
      userType: Constants.VENDOR_TYPE,
      activated: Constants.ACTIVATE,
    },
  });

  if (foundVendor) {
    delete foundVendor.dataValues.password;
    let product;

    product = await foundVendor.getProduct();

    const foundProduct = product.dataValues;

    return foundProduct;
  } else {
    return null;
  }
};
