const Status = require("../constants/status");
const Errors = require("../libs/errors/errors");
const UtilsError = require('../utils/errors');
const ValidateInputs = require("../utils/validateInputs");
const OTPManager = require("../services/otpManager");
const AccountManager = require("../services/accountManager");
const PasswordManager = require("../services/passwordManager");
const config = require("../config/config.json");

exports.getActionTypes = async (req, res, next) => {
  res.status(200).json(config.otpactiontypes);
};

exports.resend = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const { phoneNumber, actionType } = req.body;
  const actionTypes = config.otpactiontypes;

  if(actionType !== actionTypes.PASSWORD_RESET && actionType !== actionTypes.ACTIVATE_ACCOUNT) {
    next(new Errors.BadRequest(
        UtilsError.parse(actionType, "Cannot resend OTP. Action type not identified", "actionType", "body")
    ));
    return;
  }

  let foundOTP;

  try {
    foundOTP = await OTPManager.getLatestOTPByPhoneNumberAndActionType(phoneNumber, actionType);
    if (!foundOTP) {
      next(new Errors.BadRequest(
          UtilsError.parse(null, "Cannot resend OTP. It appears you do not have a previous request for this action", null, null)
      ));
      return;
    }
  } catch (error) {
    next(new Errors.GeneralError());
    return;
  }

  const otpToken = OTPManager.generateToken();

  let message;

  if(actionType === actionTypes.ACTIVATE_ACCOUNT) {
    message = OTPManager.constructActivationMessage(otpToken);
  }

  if(actionType === actionTypes.PASSWORD_RESET) {
    message = OTPManager.constructPasswordResetMessage(otpToken);
  }

  const otpExpiration = OTPManager.getExpirationTime();

  let data;

  try {
    data = await OTPManager.resendOTP(message, phoneNumber, actionType);
  } catch (error) {
    console.log(error);
  }

  data = JSON.stringify(data);

  await OTPManager.log(phoneNumber, otpToken, otpExpiration, data, null, actionType);

  res.status(Status.OK).json({
    status: Status.SUCCESS,
    data: {
      token: otpToken,
    },
  });
};

exports.very = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);
  const { phoneNumber, token, actionType } = req.body;

  let foundToken;

  try {
    foundToken = await OTPManager.getOTPByPhoneNumberAndToken(phoneNumber, token);

    if (!foundToken) {
      next(new Errors.NotFound(
          UtilsError.parse(
              token,
              "Token not found",
              "token",
              "body"
          )
      ));
      return;
    }

    if(foundToken.dataValues.action !== actionType) {
      next(new Errors.NotFound(
          UtilsError.parse(
              token,
              "Token not found. It appears you do not have an active request for this action",
              "token",
              "body"
          )
      ));
      return;
    }

    if (foundToken.dataValues.status !== Status.PENDING) {
      const tokenStatus = foundToken.dataValues.status;

      next(
        new Errors.UnprocessableEntity(
          UtilsError.parse(token, `Token ${tokenStatus}`, 'token', 'body')
        )
      );
      return;
    }

    const isExpired = OTPManager.isExpired(foundToken.dataValues.expiresIn);

    if(isExpired) {
      next(new Errors.NotFound(
          UtilsError.parse(
              token,
              "Token expired",
              "token",
              "body"
          )
      ));
      return;
    }
  } catch (error) {
    next(new Errors.GeneralError());
    return;
  }

  let response;

  try {
    response = await OTPManager.verify(phoneNumber, token);

    if (response === Status.APPROVED) {
      const OTPActionTypes = config.otpactiontypes;
      switch (actionType) {
        case OTPActionTypes.ACTIVATE_ACCOUNT:
          await AccountManager.activate(phoneNumber);
          const data = {
            statusCode: 200,
            message: "Account activated successfully",
          };
          res.status(data.statusCode).json(data);
          break;
        case OTPActionTypes.PASSWORD_RESET:
          let resetRequest = await PasswordManager.findResetRequestByPhoneNumberOrToken(phoneNumber);
          res.status(200).json({ resetToken: resetRequest.dataValues.token });
          break;
        default:
          break;
      }
    }
  } catch (error) {
    if (error.status && error.status === Status.NOT_FOUND_ERROR) {
      next(
        new Errors.NotFound(
          UtilsError.parse(token, "Could not verify token", "token", "body")
        )
      );
      return;
    }
    console.log(error);
    next(new Errors.GeneralError());
    return;
  }
};
