const Status = require("../constants/status");
const Error = require("../utils/errors");
const ValidateInputs = require("../utils/validateInputs");

const PaymentManager = require("../services/paymentManager");

exports.hook = async (req, res, next) => {
  const transactionReference = req.query.tx_ref;
  const transactionId = req.query.transaction_id;
  const status = req.query.status;

  if (transactionReference && transactionId && status) {
    let updateResponse;

    try {
      updateResponse = await PaymentManager.hook(
        transactionReference,
        transactionId
      );
    } catch (error) {
      Error.send(error.statusCode, error.message, error.data, next);
    }
    if (updateResponse) {
      return res.status(200).json({ status: "ok" });
    }
  }
};

exports.verify = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const userId = req.userId;

  const { paymentReference, transactionId } = req.body;

  let verifyResponse;

  try {
    verifyResponse = await PaymentManager.verify(
      userId,
      paymentReference,
      transactionId
    );
  } catch (error) {
    console.log(error);
    return Error.send(error.statusCode, error.message, [], next);
  }

  if (verifyResponse) {
    res.status(200).json({ status: "success", data: verifyResponse });
  }
};

exports.get = async (req, res, next) => {
  const userId = req.userId;

  const paymentReference = req.params.reference;

  let paymentResponse;

  try {
    paymentResponse = await PaymentManager.get(paymentReference);
  } catch (error) {
    console.log(error);
    return Error.send(error.statusCode, error.message, [], next);
  }

  res.status(200).json({ status: "success", data: paymentResponse });
};

exports.getStatus = async (req, res, next) => {
  const paymentReference = req.params.reference;

  let status;

  try {
    status = await PaymentManager.getStatus(paymentReference);
  } catch (error) {
    console.log(error);
    return Error.send(error.statusCode, error.message, [], next);
  }

  res.status(200).json(status);
};
