const OTP = require("../models/otp");
const { Op } = require("sequelize");
const sequelize = require("../utils/database");
const crypto = require("crypto");
const Generate = require("../utils/generate");

const generate = async () => {
  let otp, requestId;

  requestId = crypto.randomBytes(32, (err, buffer) => {
    if (err === null) {
      requestId = buffer.toString("hex");
    }
  });

  otp = Generate.randomString(6);
};
