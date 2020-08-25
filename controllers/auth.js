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
const Error = require("../utils/errors");

exports.signup = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const acceptableUserType = [Constants.CUSTOMER_TYPE, Constants.VENDOR_TYPE];
  const userType = parseInt(req.body.userType);

  if (!acceptableUserType.includes(userType)) {
    Error.send(400, "Invalid User Type", next);
    return;
  }

  const { email, password, phoneNumber, firstName, lastName } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const createUserResponse = await User.create({
    email: email,
    uuid: uuid(),
    password: hashedPassword,
    phoneNumber: phoneNumber,
    userType: userType,
  });

  const profile = await Profile.create({
    firstName: firstName,
    lastName: lastName,
    userId: createUserResponse.dataValues.id,
  });

  const data = {};
  data.statusCode = 201;
  data.message = "Account created successfully";
  data.data = {
    id: createUserResponse.dataValues.id,
    uuid: createUserResponse.dataValues.uuid,
  };

  res.status(201).json(data);
};

exports.signin = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const { email, password } = req.body;

  const foundUser = await User.findOne({ where: { email: email } });

  if (!foundUser) {
    Error.send(404, "These credentials do not match our records.", next);
  }

  const user = foundUser.dataValues;

  const hashedPassword = await bcrypt.compare(password, user.password);

  if (!hashedPassword) {
    Error.send(401, "These credentials do not match our records.", next);
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
    Error.send(500, "Internal server error", next);
  }

  const data = {
    token: token,
    userId: user.userId,
    uuid: user.uuid,
    userType: user.userType,
  };
  res.status(200).json({ data: data });
};

exports.resetPassword = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err !== null) {
      console.log(err);
      Error.send(500, "Internal server error", next);
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
        Error.send(500, "Internal server error", next);
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

    Error.send(500, "Token expired", data, next);
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

    Error.send(500, "Token expired", data, next);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updateResponse = await AccountManager.update(email, {
    password: hashedPassword,
  });

  if (!updateResponse) {
    Error.send(
      500,
      "Cannot update password at the moment. Please try again later",
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
    Error.send(500, "Internal server error", next);
  }

  res.status(200).json({
    status: "success",
    message: "Account ",
  });
};
