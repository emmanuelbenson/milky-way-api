require("dotenv").config();
const { validationResult } = require("express-validator");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");

const accountMgr = require("../services/accountManager");

exports.toggleAccountActivation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const accountAction =
    req.body.action === Status.ACTIVATE
      ? Constants.ACTIVATE
      : Constants.DEACTIVATE;

  const uuid = req.body.uuid;

  let activation;

  accountMgr
    .toggleAccountActivation(uuid, accountAction)
    .then((result) => {
      if (result) {
        let msg = "Account have been ";
        msg +=
          accountAction === Constants.ACTIVATE
            ? Status.ACTIVATED
            : Status.DEACTIVATED;
        res.status(201).json({ message: msg });
      }
    })
    .catch((err) => {
      throw err;
    });
};
