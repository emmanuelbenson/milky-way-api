const Request = require("../models/request");
const { Op } = require("sequelize");
const sequelize = require("../utils/database");

exports.create = async (requestDataObj) => {
  let createResponse;

  try {
    createResponse = await Request.create(requestDataObj);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return createResponse.dataValues.id;
};

exports.find = async (requestId) => {
  let foundRequest, error;

  try {
    foundRequest = await Request.findOne({
      where: {
        [Op.and]: [{ userId: userId }, { requestId: requestId }],
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }

  if (!foundRequest) {
    error = new Error("Request not found");
    error.statusCode = 404;
    error.data = [];

    throw error;
  }

  return foundRequest.dataValues;
};
