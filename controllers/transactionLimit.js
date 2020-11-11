const Error = require("../utils/errors");
const ValidateInputs = require("../utils/validateInputs");

const TransactionLimitManager = require("../services/transactionLimitManager");
const Status = require("../constants/status");

exports.add = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const { type, period, status } = req.body;

  let createResponse;

  try {
    createResponse = await TransactionLimitManager.set(type, period, status);
  } catch (error) {
    console.log(error);
    return Error.send(500, "Internal server error", error, next);
  }

  res.status(201).json({ status: Status.SUCCESS, data: createResponse });
};

exports.getAll = async (req, res, next) => {
  let getResponse;

  try {
    getResponse = await TransactionLimitManager.getAll();
  } catch (error) {
    console.log(error);
    return Error.send(500, "Internal server error", error, next);
  }

  res.status(200).json({ status: Status.SUCCESS, data: getResponse });
};

exports.getByType = async (req, res, next) => {
  const { type } = req.params;

  let getResponse;

  try {
    getResponse = await TransactionLimitManager.getByType(type);
  } catch (error) {
    console.log(error);
    return Error.send(500, "Internal server error", error, next);
  }

  res.status(200).json({ status: Status.SUCCESS, data: getResponse });
};

exports.getById = async (req, res, next) => {
  const { id } = req.params;

  let getResponse;

  try {
    getResponse = await TransactionLimitManager.getById(id);
  } catch (error) {
    console.log(error);
    return Error.send(500, "Internal server error", error, next);
  }

  res.status(200).json({ status: Status.SUCCESS, data: getResponse });
};

exports.update = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const { id, type, period, limit, status } = req.body;

  let transactionLimit;

  try {
    transactionLimit = await TransactionLimitManager.getById(id);
    if (!transactionLimit) {
      return Error.send(404, "Resource not found", error, next);
    }
  } catch (error) {
    console.log(error);
    return Error.send(500, "There was an error locating resource", error, next);
  }

  transactionLimit = transactionLimit.dataValues;
  console.log(transactionLimit);

  try {
    uType = type ? type : transactionLimit.transactionType;
    uPeriod = period ? period : transactionLimit.period;
    uLimit = limit ? limit : transactionLimit.limit;
    uStatus = status ? status : transactionLimit.status;

    await TransactionLimitManager.update(id, uType, uPeriod, uLimit, uStatus);
  } catch (error) {
    console.log(error);
    return Error.send(500, "Internal server error", error, next);
  }

  res
    .status(200)
    .json({ status: Status.SUCCESS, data: { message: Status.SUCCESSFUL } });
};
