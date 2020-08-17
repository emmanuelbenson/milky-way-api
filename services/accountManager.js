const Constants = require("../constants/Constants");
const User = require("../models/user");

const queryParams = [
  "id",
  "uuid",
  "email",
  "phoneNumber",
  "userType",
  "activated",
];

exports.findByUUID = async (uuID) => {
  let user;

  try {
    user = await User.findOne({
      attributes: queryParams,
      where: { uuid: uuID },
    });
  } catch (error) {}
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
