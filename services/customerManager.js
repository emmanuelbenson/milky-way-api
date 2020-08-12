const Constants = require("../constants/Constants");
const Customer = require("../models/user");

exports.getDetails = async (id) => {
  const foundCustomer = await Customer.findOne({
    where: {
      id: id,
      userType: Constants.CUSTOMER_TYPE,
      activated: Constants.ACTIVATE,
    },
  });

  if (foundCustomer) {
    delete foundCustomer.dataValues.password;
    let profile;
    let customer;

    profile = await foundCustomer.getProfile();
    address = await foundCustomer.getAddress();

    customer = foundCustomer.dataValues;
    const profileData = profile ? profile.dataValues : null;
    const addressData = address ? address.dataValues : null;

    customer.profile = profileData;
    customer.address = addressData;

    return customer;
  } else {
    return null;
  }
};
