require("dotenv").config();
const ValidateInput = require("../utils/validateInputs");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const Error = require("../utils/errors");

const accountMgr = require("../services/accountManager");

exports.toggleAccountActivation = (req, res, next) => {
  ValidateInput.validate(req, res, next);

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
      console.log(err);
      Error.send(500, "Internal server error", [], next);
    });
};
