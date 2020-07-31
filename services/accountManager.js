const User = require("../models/user");

exports.getTypeByField = async (field) => {
  let response;
  try {
    response = User.findAll({ where: { field: field } });
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
