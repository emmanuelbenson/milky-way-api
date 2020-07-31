require("dotenv").config();
const { validationResult } = require("express-validator");
const Constants = require("../constants/Constants");
const Status = require("../constants/status");

const accountMgr = require("../services/accountManager");

exports.activateAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    throw error;
  }

  const uuid = req.body.uuid;
  let activation;

  try {
    activation = await accountMgr.activateAccount(uuid);
  } catch (err) {
    next(err);
  }
  if (activation) {
    res.status(201).json({ message: "Account is actiavted" });
  }
};
