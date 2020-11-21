const Status = require("../constants/status");
const Errors = require("../libs/errors/errors");
const ValidateInputs = require("../utils/validateInputs");
const OTPManager = require("../services/otpManager");
const AccountManager = require("../services/accountManager");
const config = require("../config/config.json");

exports.send = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);
};

exports.getActionTypes = async (req, res, next) => {
  const actionTypes = [config.otpactiontypes];
  res.status(200).json(actionTypes);
};

exports.resend = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const { tokenId, phoneNumber, otpAction } = req.body;

  // Check token in db
  let foundToken;

  try {
    foundToken = await OTPManager.getToken(tokenId, phoneNumber);
    if (!foundToken) {
      next(new Errors.NotFound("Token ID not found", token, "token", "body"));
      return;
    }

    foundToken = foundToken.dataValues;

    if (
      foundToken.action !== otpAction ||
      foundToken.status === Status.APPROVED
    ) {
      next(new Errors.Forbidden("Cannot resend OTP"));
      return;
    }
  } catch (error) {
    next(new Errors.GeneralError());
    return;
  }

  try {
    const data = await OTPManager.send(phoneNumber, otpAction);
    res.status(Status.OK).json({
      status: Status.SUCCESS,
      data: {
        tokenId: data.id,
        status: data.status,
      },
    });
  } catch (error) {
    console.log(error);
    next(Errors.GeneralError());
  }
};

exports.very = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);
  const { tokenId, phoneNumber, token } = req.body;

  // Check token in db
  let foundToken;

  try {
    foundToken = await OTPManager.getToken(tokenId, phoneNumber);
    if (!foundToken) {
      next(new Errors.NotFound("Token not found", token, "token", "body"));
      return;
    }

    if (foundToken.dataValues.status !== Status.PENDING) {
      const tokenStatus = foundToken.dataValues.status;

      next(
        new Errors.UnprocessableEntity(
          `Token ${tokenStatus}`,
          token,
          "token",
          "body"
        )
      );
      return;
    }
  } catch (error) {
    next(new Errors.GeneralError());
    return;
  }

  let response;

  try {
    response = await OTPManager.verify(tokenId, phoneNumber, token);
    const OTPResponse = response.dataValues;

    if (OTPResponse.status === Status.APPROVED) {
      const OTPActionTypes = config.otpactiontypes;
      switch (OTPResponse.action) {
        case OTPActionTypes.ACTIVATE_ACCOUNT:
          activated = await AccountManager.activate(phoneNumber);
          const data = {
            statusCode: 200,
            message: "Account activated successfully",
          };
          res.status(data.statusCode).json(data);
          break;

        default:
          break;
      }
    }
  } catch (error) {
    if (error.status && error.status === Status.NOT_FOUND_ERROR) {
      next(
        new Errors.NotFound(
          "Token already used or not found",
          token,
          "token",
          "body"
        )
      );
      return;
    }
    console.log(error);
    next(new Errors.GeneralError());
    return;
  }
};
