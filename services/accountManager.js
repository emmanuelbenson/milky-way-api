const Constants = require("../constants/Constants");
require("../constants/status");
const Profile = require("../models/profile");
const User = require("../models/user");

const queryParams = [
  "id",
  "uuid",
  "email",
  "phoneNumber",
  "userType",
  "activated",
];

exports.accountExists = async (phoneNumber = null) => {
  let user;

  try {
    user = await User.findOne({ attributes: ["id"], where: { phoneNumber } });
    return !!user;

  } catch (error) {
    throw error;
  }
};

exports.isVerified = async (phoneNumber = null) => {
  try {
    const user = await this.findByPhoneNumber(phoneNumber);

    return user.dataValues.activated === Constants.ACCOUNT_ACTIVATED;

  } catch (error) {
    throw error;
  }
};

exports.addUser = async (user = {}) => {
  let newUser;

  try {
    newUser = await User.create(user);

    return newUser;
  } catch (error) {
    throw error;
  }
};

exports.addProfile = async (profile = {}) => {
  let newProfile;

  try {
    newProfile = await Profile.create(profile);
    return newProfile;
  } catch (error) {
    throw error;
  }
};

exports.findByPhoneNumber = async (phoneNumber) => {
  let user;

  try {
    user = await User.findOne({
      where: { phoneNumber },
      include: Profile,
    });
  } catch (error) {
    throw error;
  }
  return user;
};

exports.findByUUID = async (uuID) => {
  let user;

  try {
    user = await User.findOne({
      attributes: queryParams,
      where: { uuid: uuID },
      include: Profile,
    });
  } catch (error) {
    throw error;
  }
  return user;
};

exports.find = async (id) => {
  let user;

  try {
    user = await User.findOne({
      attributes: queryParams,
      where: { id },
      include: Profile,
    });
  } catch (error) {
    throw error;
  }
  return user;
};

exports.activate = async (phoneNumber) => {
  try {
    const activated = await User.update(
      { activated: true },
      { where: { phoneNumber } }
    );
    if (activated) {
      return activated[0];
    }
  } catch (err) {
    throw err;
  }
};

exports.update = async (phoneNumber, fields = {}) => {
  try {
    await User.update(fields, {
      where: { phoneNumber },
    });
  } catch (err) {
    throw err;
  }

  return true;
};

exports.delete = async (userId) => {
  try {
    await User.destroy( { where: { id: userId } } );
    await Profile.destroy({ where: { userId }});
  } catch (e) {
    throw e;
  }
}