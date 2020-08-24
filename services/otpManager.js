const OTP = require("../models/otp");
const { Op } = require("sequelize");
const sequelize = require("../utils/database");
const crypto = require("crypto");
const Generate = require("../utils/generate");
const moment = require("moment");
const TimestampExpiration = require("../utils/timestampExpiration");

exports.generate = async () => {
  let otp;
  let requestId;

  const buf = crypto.randomBytes(32);

  requestId = buf.toString("hex");

  otp = Generate.otp();

  const response = await OTP.create({
    requestId: requestId,
    otp: otp,
    expiresIn: moment().add(1, "h"),
  });

  return response.dataValues.requestId;
};

exports.verify = async (otp, requestId) => {
  let foundOtp, expired, error;

  try {
    foundOtp = await OTP.findOne({
      where: {
        [Op.and]: [{ otp: otp }, { requestId: requestId }],
      },
    });
  } catch (err) {
    console.log(err);
  }

  if (!foundOtp) {
    error = new Error("OTP not found");
    error.statusCode = 404;
    error.data = [
      {
        value: "OTP",
        msg: "OTP was not found",
        param: "otp",
        location: "body",
      },
    ];
    throw error;
  }

  if (foundOtp.dataValues.used) {
    error = new Error("OTP used");
    error.statusCode = 422;
    error.data = [
      {
        value: "OTP",
        msg: "OTP have been used",
        param: "otp",
        location: "body",
      },
    ];

    throw error;
  }

  if (TimestampExpiration.check(foundOtp.dataValues.expiresIn)) {
    error = new Error("OTP expired");
    error.statusCode = 422;
    error.data = [
      {
        value: "OTP",
        msg: "OTP has expired",
        param: "otp",
        location: "body",
      },
    ];

    throw error;
  }

  return true;
};
