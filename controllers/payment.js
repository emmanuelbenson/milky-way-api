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

exports.getStatus = async (transactionReference = null) => {
  let payment;

  try {
    payment = await Payment.findOne({
      where: {
        transactionReference,
      },
      attributes: ["status"],
    });
  } catch (error) {
    throw error;
  }

  return payment.dataValues;
};

exports.get = async (transactionReference = null) => {
  let payment;

  try {
    payment = await Payment.findOne({
      where: {
        transactionReference,
      },
    });
  } catch (error) {
    throw error;
  }

  return payment;
};
