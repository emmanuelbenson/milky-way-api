const TransactionLimit = require("../models/transactionLimit");
const Status = require("../constants/status");
const { Op } = require("sequelize");
const Constants = require("../constants/Constants");
const GasStationManager = require("./gasStationManager");
const OrderManager = require("./orderManager");

const moment = require("moment");
const { transaction } = require("../utils/database");

exports.set = async (transactionType, period, status = null) => {
  let response;

  try {
    response = await TransactionLimit.create({
      transactionType,
      period,
      status: status ? status : Status.ENABLED,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

exports.getAll = async () => {
  let response;

  try {
    response = await TransactionLimit.findAll();
    return response;
  } catch (error) {
    throw error;
  }
};

exports.getById = async (id) => {
  let response;

  try {
    response = await TransactionLimit.findByPk(id);
    return response;
  } catch (error) {
    throw error;
  }
};

exports.getByType = async (type = "") => {
  let response;

  try {
    response = await TransactionLimit.findOne({
      where: { transactionType: type, status: Status.ENABLED },
    });

    return response;
  } catch (error) {
    throw error;
  }
};

exports.update = async (id, transactionType, period, limit, status) => {
  let updateResponse;

  try {
    updateResponse = await TransactionLimit.update(
      { transactionType, period, limit, status },
      { where: { id: { [Op.eq]: id } } }
    );
  } catch (error) {
    throw error;
  }

  return updateResponse;
};

exports.reachedLimit = async (gasStationId) => {
  const transactionType = Constants.GAS_PURCHASE_TRANSACTION_TYPE;
  let limitReached = false;

  let gasStation;

  try {
    gasStation = await GasStationManager.find(gasStationId);
  } catch (error) {
    throw error;
  }

  let transactionLimit;

  try {
    transactionLimit = await TransactionLimit.findOne({
      where: {
        [Op.and]: [{ transactionType }, { status: Status.ENABLED }],
      },
    });

    if (!transactionLimit) {
      return false; // This indicate that no limit is set. Transaction can proceed
    }

    transactionLimit = transactionLimit.dataValues;
  } catch (error) {
    throw error;
  }

  const period = transactionLimit.period;

  let transactions;

  switch (period) {
    case Constants.TRANSACTION_LIMIT_DAILY:
      transactions = await OrderManager.getStartAndEndDate(
        moment().startOf("day"),
        moment().endOf("day")
      );
      if (transactions.length > 0)
        limitReached =
          transactions.length < transactionLimit.limit ? false : true;
      break;
    case Constants.TRANSACTION_LIMIT_WEEKLY:
      transactions = await OrderManager.getStartAndEndDate(
        moment().startOf("week"),
        moment().endOf("week")
      );
      if (transactions.length > 0)
        limitReached =
          transactions.length < transactionLimit.limit ? false : true;
      break;
    case Constants.TRANSACTION_LIMIT_MONTHLY:
      transactions = await OrderManager.getStartAndEndDate(
        moment().startOf("month"),
        moment().endOf("month")
      );
      if (transactions.length > 0)
        limitReached =
          transactions.length < transactionLimit.limit ? false : true;
      break;
    case Constants.TRANSACTION_LIMIT_QUARTERLY:
      transactions = await OrderManager.getStartAndEndDate(
        moment().startOf("quater"),
        moment().endOf("quater")
      );
      if (transactions.length > 0)
        limitReached =
          transactions.length < transactionLimit.limit ? false : true;
      break;
    case Constants.TRANSACTION_LIMIT_YEARLY:
      transactions = await OrderManager.getStartAndEndDate(
        moment().startOf("year"),
        moment().endOf("year")
      );
      if (transactions.length > 0)
        limitReached =
          transactions.length < transactionLimit.limit ? false : true;
    default:
      transactions = [];
      limitReached = false;
      break;
  }
  return limitReached;
};
