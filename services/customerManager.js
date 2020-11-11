const Constants = require("../constants/Constants");
const Customer = require("../models/user");

exports.getDetails = async (id) => {
  const foundCustomer = await Customer.findOne({
    where: {
      id: id,
      userType: parseInt(Constants.CUSTOMER_TYPE),
      activated: Constants.ACTIVATE,
    },
  });

  if (foundCustomer) {
    delete foundCustomer.dataValues.password;
    let customer, profile, address;

    try {
      profile = await foundCustomer.getProfile();
      address = await foundCustomer.getAddress();
    } catch (err) {
      console.log(err);
      throw err;
    }

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

exports.customerExist = async (id) => {
  const customer = await this.getDetails(id);

  if (customer) {
    return true;
  }
  return false;
};
