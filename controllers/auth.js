require("dotenv").config();

const bcrypt = require("bcryptjs");
const { uuid } = require("uuidv4");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const moment = require("moment");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");

const User = require("../models/user");
const Profile = require("../models/profile");
const PasswordReset = require("../models/passwordreset");
const OTPManager = require("../services/otpManager");
const AccountManager = require("../services/accountManager");
const ValidateInput = require("../utils/validateInputs");
// const Error = require("../utils/errors");
// const handleErrors = require("../middlewares/handleErrors");
const errors = require("../libs/errors/errors");

exports.signup = async (req, res, next) => {
  ValidateInput.validate(req, res, next);
  let error;

  const acceptableUserType = [Constants.CUSTOMER_TYPE, Constants.VENDOR_TYPE];
  const userType = parseInt(req.body.userType);

  if (!acceptableUserType.includes(userType)) {
    next(
      new errors.UnprocessableEntity(
        "Invalid User Type",
        userType,
        "userType",
        "body"
      )
    );
    return;
  }

  const { email, password, phoneNumber, firstName, lastName } = req.body;

  if (email && !ValidateInput.isEmail(email)) {
    next(
      new errors.UnprocessableEntity("Email is invalid", email, "email", "body")
    );
    return;
  }

  const isExists = await AccountManager.accountExists(phoneNumber);

  if (isExists) {
    next(
      new errors.UnprocessableEntity(
        "Account already exist",
        phoneNumber,
        "phoneNumber",
        "body"
      )
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
    next(new errors.GeneralError());
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
    next(new errors.GeneralError());
    return;
  }

  if (!foundUser) {
    next(new errors.NotFound("These credentials do not match our records"));
    return;
  }

  const user = foundUser.dataValues;

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    console.log(error);
    next(new errors.GeneralError());
    return;
  }

  if (!hashedPassword) {
    next(new errors.NotFound("These credentials do not match our records"));
    return;
  }

  const isVerified = await AccountManager.isVerified(user.phoneNumber);

  if (!isVerified) {
    next(new errors.Unauthorized("Unverified account"));
    return;
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
    next(new errors.GeneralError());
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

  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err !== null) {
      console.log(err);
      next(errors.GeneralError());
      return;
    }

    const token = buffer.toString("hex");
    PasswordReset.create({
      email: email,
      token: token,
      expiresIn: moment().add(2, "h"), // Expires in 1hr or 2hrs in daylight saving
      status: Status.UNEXPIRED,
    })
      .then(() => {
        // Send email
        const data = {};
        data.message = `Password reset link sent to ${email}`;
        data.status = "success";
        res.status(200).json(data);
      })
      .catch((err) => {
        console.log(err);
        return Error.send(500, "Internal server error", [], next);
      });
  });
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
