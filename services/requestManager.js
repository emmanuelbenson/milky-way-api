const Request = require("../models/request");
const { Op } = require("sequelize");
const { uuid } = require("uuidv4");

exports.create = async (
  userId,
  requestId,
  requestServiceManager,
  requestServiceManagerMethod,
  serviceManagerMethodArrayParam
) => {
  let createResponse;
  let uuid = uuid();

  try {
    createResponse = await Request.create({
      userId,
      requestId,
      uuid,
      requestServiceManager,
      requestServiceManagerMethod,
      serviceManagerMethodArrayParam,
    });
  } catch (err) {
    throw err;
  }

  return createResponse.dataValues.requestId;
};

exports.getRequestByRequestId = async (userId, requestId) => {
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

  return foundRequest.dataValues;
};
