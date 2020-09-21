const Error = require("../utils/errors");
const Constant = require("../constants/Constants");
const ValidateInputs = require("../utils/validateInputs");
const AccountManager = require("../services/accountManager");
const VendorManager = require("../services/vendorManager");

exports.getTransactions = async (req, res, next) => {
  const userId = req.userId;
  let transactions;

  try {
    transactions = await VendorManager.getTransactions(userId);
    res.status(200).json({
      status: "success",
      transactionCount: transactions.length,
      transactions,
    });
  } catch (error) {
    console.log(error);
    if (error.statusCode && error.message)
      return Error.send(error.status, error.message, error.data, next);
    return Error.send(500, "Internal server error", [], next);
  }
};
