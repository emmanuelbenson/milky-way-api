require("dotenv").config();

const bcrypt = require("bcryptjs");
const { uuid } = require("uuidv4");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const moment = require("moment");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");

const PasswordReset = require("../models/passwordreset");
const OTPManager = require("../services/otpManager");
const AccountManager = require("../services/accountManager");
const ValidateInput = require("../utils/validateInputs");
const Errors = require("../libs/errors/errors");
const UtilError = require('../utils/errors');

exports.signup = async (req, res, next) => {
  ValidateInput.validate(req, res, next);
  let error;

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

  const hashedPassword = await bcrypt.hash(password, 12);

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

  let profileObj = {
    firstName: firstName,
    lastName: lastName,
    userId: newUser.dataValues.id,
  };

  const profile = await AccountManager.addProfile(profileObj);

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
                "We could not verify your phone number. Please, check it and try again",
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
  let token;
  try {
    const cryptoBuff = crypto.randomBytes(32);
    token = cryptoBuff.toString('hex');
  } catch (error) {
    console.log(error);
    next(new Errors.GeneralError());
    return;
  }

  try {
    await PasswordReset.create({
      phoneNumber,
      token,
      expiresIn: moment().add(2, 'h'),
      status: Status.UNEXPIRED
    })
  } catch (error) {
    console.log(error);
    next(new Errors.GeneralError())
    return;
  }

  let OTPLog;
  try {
    OTPLog = await OTPManager.send(phoneNumber, Constants.OTP_ACTION_PASSWORD_RESET);
  } catch(error) {
    console.log(error);
    next(new Errors.GeneralError());
  }

  const data = {};
  data.phoneNumber = phoneNumber;
  data.tokenId = OTPLog.id;
  data.message = `OTP token have been sent to your registered phone number`;
  data.status = "success";

  res.status(200).json(data);
};

exports.passwordReset = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const { email, token, newPassword } = req.body;

  let foundToken, error;

  foundToken = await PasswordReset.findOne({
    where: { token: token },
  });

  if (!foundToken) {
    const data = [
      {
        value: "",
        msg: "Token not found",
        param: "token",
        location: "body",
      },
    ];

    return Error.send(500, "Token expired", data, next);
  }

  if (foundToken.dataValues.expiresIn < moment()) {
    const data = [
      {
        value: "",
        msg: "Token expired",
        param: "token",
        location: "body",
      },
    ];

    return Error.send(500, "Token expired", data, next);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updateResponse = await AccountManager.update(email, {
    password: hashedPassword,
  });

  if (!updateResponse) {
    return Error.send(
      500,
      "Cannot update password at the moment. Please try again later",
      [],
      next
    );
  }

  await PasswordReset.update(
    { status: Status.EXPIRED },
    { where: { token: token } }
  );

  res.status(200).json({
    message: "Password was updated successfully",
  });
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
