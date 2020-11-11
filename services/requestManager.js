const Request = require("../models/request");
const { Op } = require("sequelize");
const sequelize = require("../utils/database");

exports.create = async (
  userId,
  requestId,
  requestServiceManager,
  requestServiceManagerMethod,
  serviceManagerMethodArrayParam
) => {
  let createResponse;

  try {
    createResponse = await Request.create({
      userId,
      requestId,
      requestServiceManager,
      requestServiceManagerMethod,
      serviceManagerMethodArrayParam,
    });
  } catch (err) {
    throw err;
  }

  return createResponse.dataValues.requestId;
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
