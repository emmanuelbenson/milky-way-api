const OTP = require("../libs/modules/twilio/otp");
const OTPLog = require("../models/otp_logs");
const config = require("../config/config.json");
const { Op } = require("sequelize");
const Errors = require("../libs/errors/errors");

const CHANNEL = config.otpchannel.providers.twilio.channel;
const PROVIDER = config.otpchannel.providers.twilio.name;

exports.send = async (phoneNumber, action) => {
  let log;
  try {
    let OTPCreateResponse = await OTP.send(phoneNumber, CHANNEL, PROVIDER);
    let status = OTPCreateResponse.status;

    OTPCreateResponse = JSON.stringify(OTPCreateResponse);
    log = await logCreate(
      phoneNumber,
      OTPCreateResponse,
      PROVIDER,
      action,
      status
    );
    return log;
  } catch (error) {
    console.log(error);
  }
};

exports.resend = async (tokenId, phoneNumber, actionType) => {
  try {
    const foundToken = await this.getToken(tokenId, phoneNumber);
  } catch (error) {}
};

exports.getToken = async (id, phoneNumber) => {
  //check if token exist
  let foundToken;

  try {
    foundToken = await OTPLog.findOne({
      where: { [Op.and]: [{ id }, { phoneNumber }] },
    });
    return foundToken;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.verify = async (id, phoneNumber, token) => {
  //verify token
  try {
    let OTPVerifyResponse = await OTP.verify(phoneNumber, token);
    let status = OTPVerifyResponse.status;

    OTPVerifyResponse = JSON.stringify(OTPVerifyResponse);

    await logVerify(phoneNumber, OTPVerifyResponse, status);

    const verifyPayload = await this.getToken(id, phoneNumber);
    return verifyPayload;
  } catch (error) {
    throw error;
  }
};

async function logCreate(
  phoneNumber,
  createResponse = "",
  provider = "",
  action = "",
  status = "pending"
) {
  let log;
  try {
    log = await OTPLog.create({
      phoneNumber: phoneNumber,
      createResponse: createResponse,
      verifyResponse: null,
      provider: provider,
      action: action,
      status: status,
    });
    return log;
  } catch (error) {
    console.log(error);
  }
}

async function logVerify(phoneNumber, verifyResponse, status = "pending") {
  try {
    await OTPLog.update({ verifyResponse, status }, { where: { phoneNumber } });
  } catch (error) {
    throw error;
  }
}
