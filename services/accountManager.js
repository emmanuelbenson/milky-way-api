const Constants = require("../constants/Constants");
const User = require("../models/user");

exports.getTypeByField = async (field) => {
  let response;
  try {
    response = await User.findOne({ where: { field: field } });
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!response) {
    const error = new Error(`User with ${uuid} was not found`);
    error.statusCode = 404;
    throw error;
  }
  return response.dataValues.uuid;
};

exports.activateAccount = async (uuid) => {
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
          { activated: Constants.ACTIVATE },
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
