require("dotenv").config();
const Config = require('../config/config.json');
const bcrypt = require("bcryptjs");
const { uuid } = require("uuidv4");
const jwt = require("jsonwebtoken");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");

const OTPManager = require("../services/otpManager");
const AccountManager = require("../services/accountManager");
const PasswordManager = require('../services/passwordManager');
const ValidateInput = require("../utils/validateInputs");
const Errors = require("../libs/errors/errors");
const UtilError = require('../utils/errors');
const { validationResult } = require('express-validator');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new Errors.UnprocessableEntity(errors));
  }

  const acceptableUserType = [Constants.CUSTOMER_TYPE, Constants.VENDOR_TYPE];
  const userType = parseInt(req.body.userType);

  if (!acceptableUserType.includes(userType)) {
    next(
      new Errors.UnprocessableEntity(UtilError.parse(userType, "Invalid User Type", "userType", "body"))
    );
    return;
  }

  const { email, password, phoneNumber, firstName, lastName } = req.body;

  if (email && !ValidateInput.isEmail(email)) {
    next(new Errors.UnprocessableEntity( UtilError.parse(email, 'Email is invalid', 'email', 'body') ));
    return;
  }

  let isExists;

  try {
    isExists = await AccountManager.accountExists(phoneNumber);
  } catch (error) {
    console.log(error);
    next(new Errors.GeneralError());
    return;
  }

  if (isExists) {
    next(new Errors.UnprocessableEntity(
        UtilError.parse(
            phoneNumber,
            "Account already exist",
            "phoneNumber",
            "body"))
    );
    return;
  }

  let hashedPassword;
  try {
    hashedPassword = await PasswordManager.hash(password);
  }catch (e) {
    console.log(e);
    next( new Errors.GeneralError());
    return;
  }

  const userObj = {
    email: email ? email : null,
    uuid: uuid(),
    password: hashedPassword,
    phoneNumber: phoneNumber,
    userType: userType,
  };

  let newUser;

  try {
    newUser = await AccountManager.addUser(userObj);
  } catch (error) {
    console.log(error);
    next(new Errors.GeneralError());
    return;
  }

  await AccountManager.addProfile(
      {
        firstName: firstName,
        lastName: lastName,
        userId: newUser.dataValues.id,
      }
  );

  const data = {};
  data.statusCode = 201;
  data.message = "Account created successfully";
  data.data = {
    id: newUser.dataValues.id,
    uuid: newUser.dataValues.uuid,
  };

  const OTP_ACTION = Constants.OTP_ACTION_ACTIVATE_ACCOUNT;

  let OTPData;

  try {
    OTPData = await OTPManager.send(
        newUser.dataValues.phoneNumber,
        OTP_ACTION
    );
  } catch (e) {
    if(e.status === 400) {
      await AccountManager.delete(newUser.dataValues.id);
    }
    console.log(e);
    next(
        new Errors.UnprocessableEntity(
            UtilError.parse(
                phoneNumber,
                "We could not verify your phone number. Please, check and try again",
                "phoneNumber",
                "body"
            )
        )
    );
    return;
  }

  data.data.tokenId = OTPData.id;
  data.data.phoneNumber = phoneNumber;

  res.status(201).json(data);
};

exports.signin = async (req, res, next) => {
  ValidateInput.validate(req, res, next);
  let error;

  const { phoneNumber, password } = req.body;

  let foundUser;

  try {
    foundUser = await AccountManager.findByPhoneNumber(phoneNumber);
  } catch (error) {
    console.log(error);
    next(new Errors.GeneralError());
    return;
  }

  if (!foundUser) {
    next(new Errors.NotFound(
        UtilError.parse(
            "",
            "These credentials do not match our records",
            "",
            "")));
    return;
  }

  const user = foundUser.dataValues;

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    console.log(error);
    next(new Errors.GeneralError());
    return;
  }

  if (!hashedPassword) {
    next(new Errors.NotFound(
        UtilError.parse(
            "",
            "These credentials do not match our records",
            "",
            "")
        )
    );
    return;
  }

  const isVerified = await AccountManager.isVerified(user.phoneNumber);

  if (!isVerified) {
    const OTP_ACTION = Constants.OTP_ACTION_ACTIVATE_ACCOUNT;

    const OTPData = await OTPManager.send(
        phoneNumber,
        OTP_ACTION
    );

    const data = {
      tokenId: OTPData.id,
      phoneNumber: phoneNumber,
      message: "Your account have not been verified"
    }

    res.status(401).json(data);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: user.id, uuid: user.uuid, userType: user.userType },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  delete user.password;

  const data = {
    token: token,
    userDetails: user,
  };
  res.status(200).json({ data: data });
};

exports.resetPassword = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const { phoneNumber } = req.body;
  let foundAccount;
  try {
    foundAccount = await AccountManager.accountExists(phoneNumber);
    if(!foundAccount) {
      const data = {
        tokenId: '0001100',
        phoneNumber: phoneNumber,
        message: `OTP have been sent to this phone number if it is registered on our system`,
        status: "success"
      }

      res.status(200).json(data);
      return;
    }
  }catch (e) {
    console.log(e);
    next(new Errors.GeneralError());
    return;
  }

  let hasActiveReset;
  let OTPLog;

  try {
    hasActiveReset = await PasswordManager.hasActiveResetRequest(phoneNumber);
    if(hasActiveReset) {
      OTPLog = await OTPManager.send(phoneNumber, Config.otpactiontypes.PASSWORD_RESET);
      const data = {
        tokenId: OTPLog.id,
        phoneNumber: phoneNumber,
        message: `OTP have been sent to this phone number if it is registered on our system`,
        status: "success"
      }

      res.status(200).json(data);
      return;
    }

  }catch (e) {
    console.log(e);
    next(new Errors.GeneralError());
    return;
  }

  try {
    await PasswordManager.initReset(phoneNumber);
    OTPLog = await OTPManager.send(phoneNumber, Constants.OTP_ACTION_PASSWORD_RESET);

    const data = {
      phoneNumber: phoneNumber,
      tokenId: OTPLog.id,
      message: `OTP have been sent to this phone number if it is registered on our system`,
      status: "success"
    };

    res.status(200).json(data);
  } catch (e) {
    console.log(e);
    next(new Errors.GeneralError());
  }
};

exports.passwordReset = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const { phoneNumber, token, password } = req.body;

  let tokenIsExpired;

  try {
    tokenIsExpired = await PasswordManager.tokenIsExpired(token);
    if(tokenIsExpired) {
      next(new Errors.Forbidden(
          UtilError.parse(
              token,
              "Token has expired",
              "token",
              "body")));
      return;
    }
  }catch (e) {
    console.log(e);
    next( new Errors.GeneralError());
    return;
  }

  try {
    const hashedPassword = await PasswordManager.hash(password);
    await PasswordManager.reset(phoneNumber, token, hashedPassword);

    res.status(200).json({
      message: "Password was updated successfully",
    });
  } catch (e) {
    console.log(e);
    next( new Errors.GeneralError());
  }
};

exports.toggleAccountState = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const { action, uuid } = req.body;

  const actionArray = [Status.ACTIVATE, Status.DEACTIVATE];

  if (actionArray.includes(action)) {
    res.send("INCLUDED");
  }

  res.send("NOT INCLUDED");

  let response;

  try {
    response = await AccountManager.toggleAccountActivation(uuid, action);
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  res.status(200).json({
    status: "success",
    message: "Account ",
  });
};
