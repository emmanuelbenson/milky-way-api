const Constants = require("../constants/Constants");
const { GeneralError } = require("../libs/errors/errors");
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
    if (user) return true;
    return false;
  } catch (error) {
    throw new GeneralError();
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

exports.findByUUID = async (uuID) => {
  let user;

  try {
    user = await User.findOne({
      attributes: queryParams,
      where: { uuid: uuID },
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

exports.toggleAccountActivation = async (uuid, action) => {
  let foundAccount;
  try {
    foundAccount = await User.findOne({ where: { uuid: uuid } });

    if (foundAccount === null) {
      const error = new Error(`User with uuid ${uuid} was not found`);
      error.statusCode = 404;
      error.data = foundAccount;
      throw error;
    } else {
      try {
        const activated = await User.update(
          { activated: action },
          { where: { uuid: uuid } }
        );
        if (activated) {
          return activated[0];
        }
      } catch (err) {
        throw err;
      }
    }
  } catch (err) {
    throw err;
  }
};

exports.update = async (email, fields = {}) => {
  try {
    await User.update(fields, {
      where: { email: email },
    });
  } catch (err) {
    throw err;
  }

  return true;
};
