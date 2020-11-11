const { Op } = require("sequelize");
const AuditTrail = require("../models/audit_trail_log");

exports.record = async (userId, actionType, req, data = []) => {
  let trail;

  try {
    const endPoint = req.hostname + req.originalUrl;
    const endPointSource = req.headers.source;
    const ipAddress = req.ip;
    const userAgent = JSON.stringify(req.useragent);
    const requestBody = JSON.stringify(req.body);
    const responseBody = data ? JSON.stringify(data) : null;

    trail = await AuditTrail.create({
      userId,
      actionType,
      endPoint,
      endPointSource,
      ipAddress,
      userAgent,
      requestBody,
      responseBody,
    });
  } catch (error) {
    console.log(error);
  }

  return true;
};

exports.findByUserID = async (userId) => {
  let trails;

  try {
    trails = await AuditTrail.findAll({
      where: { userId: { [Op.eq]: userId } },
    });
  } catch (error) {
    console.log(error);
  }

  return trails;
};

exports.findByUserIDAndTrailID = async (userId, id) => {
  let trail;

  try {
    trail = await AuditTrail.findOne({
      where: { [Op.and]: [{ userId }, { id }] },
    });
  } catch (error) {
    console.log(error);
  }

  return trail;
};

exports.getByUserIDAndActionType = async (userId, actionType) => {
  let trails;

  try {
    trails = await AuditTrail.findAll({
      where: { [Op.and]: [{ userId }, { actionType }] },
    });
  } catch (error) {
    console.log(error);
  }

  return trails;
};

exports.getAll = async (offSet = 10, limit = 2) => {
  let trails;

  try {
    trails = await AuditTrail.findAll({ offset, limit });
  } catch (error) {
    console.log(error);
  }

  return trails;
};
