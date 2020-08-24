require("dotenv").config();

const bcrypt = require("bcryptjs");
const { uuid } = require("uuidv4");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const moment = require("moment");
const Status = require("../constants/status");

const User = require("../models/user");
const Profile = require("../models/profile");
const PasswordReset = require("../models/passwordreset");
const OTPManager = require("../services/otpManager");
const AccountManager = require("../services/accountManager");
const ValidateInput = require("../utils/validateInputs");
const Error = require("../utils/errors");

exports.signup = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const email = req.body.email;
  const password = req.body.password;
  const phoneNumber = req.body.phoneNumber;
  const userType = req.body.userType;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

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
    const data = [
      {
        value: "",
        msg: "Invalid email/password",
        param: "email/password",
        location: "body",
      },
    ];
    Error.send(404, "These credentials do not match our records.", data, next);
  }

  const user = foundUser.dataValues;

  const hashedPassword = await bcrypt.compare(password, user.password);

  if (!hashedPassword) {
    Error.send(
      401,
      "These credentials do not match our records.",
      [
        {
          value: "",
          msg: "Invalid email/password",
          param: "email/password",
          location: "body",
        },
      ],
      next
    );
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
    Error.send(500, "Internal server error", [], next);
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
      const error = new Error("Internal server error");
      error.statusCode = 500;
      error.data = err.array();
      throw error;
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
        const error = new Error(err.errors[0].message);
        error.statusCode = 500;
        error.data = err.errors[0];
        delete error.data.origin;
        delete error.data.instance;
        delete error.data.validatorKey;
        delete error.data.validatorName;
        delete error.data.validatorArgs;
        next(error);
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

    throw error;
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
    const data = [
      {
        value: "",
        msg: "Token expired",
        param: "token",
        location: "body",
      },
    ];

    Error.send(
      500,
      "Cannot update password at the moment. Please try again later",
      data,
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
