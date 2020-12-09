const TwilioOTP = require("../libs/modules/twilio/otp");
const OTPLog = require("../models/otp_logs");
const config = require("../config/config.json");
const { Op } = require("sequelize");
const Generate = require("../utils/generate");
const TimestampExpiration = require("../utils/timestampExpiration");
const Constants = require("../constants/Constants");
const moment = require('moment');

const CHANNEL = config.otpchannel.providers.twilio.channel;
const PROVIDER = config.otpchannel.providers.twilio.name;
const OTP_LENGTH = 6;

/**
 * Generate
 * Send
 * Verify
 * Check Expiration
 * Re-send
 * Log request/response
 * Retrieve request/response for audit
 */

exports.sendOTP = async (message, phoneNumber) => {
  try {
    return await TwilioOTP.sendSms(message, phoneNumber);
  } catch (e) {
    throw e;
  }
}

exports.resendOTP = async (message, phoneNumber, action) => {
  let foundOtp;

  try {
    foundOtp = await this.getLatestOTPByPhoneNumberAndActionType(phoneNumber, action);

    if(foundOtp) {
      await invalidateOTP(foundOtp.dataValues.id);
    }
    return await this.sendOTP(message, phoneNumber);
  }catch (e) {
    throw e;
  }
}

exports.getLatestOTPByPhoneNumberAndActionType = async (phoneNumber, action) => {
  let otp;
  try {
    otp = await OTPLog.findOne( {
      where: { phoneNumber, action },
      order: [['createdAt', 'DESC']]
    } );
    return otp;
  }catch (e) {
    throw e;
  }
}

exports.getOTPByPhoneNumberAndToken = async (phoneNumber, token) => {
  let otp;
  try {
    otp = await OTPLog.findOne( {
      where: {
        [Op.and]: [
          { phoneNumber },
          { token }
        ]
      }
    } );
    return otp;
  }catch (e) {
    throw e;
  }
}

exports.verify = async (phoneNumber, token) => {
  let otp;

  try {
    otp = await this.getOTPByPhoneNumberAndToken(phoneNumber, token);

    if(!otp) {
      return Constants.OTP_NOT_FOUND;
    }

    if(otp && otp.dataValues.status === Constants.OTP_PENDING) {
      await OTPLog.update({ status: Constants.OTP_APPROVED }, {
        where: {
          [Op.and]: [
            { phoneNumber },
            { token }
          ]
        }
      });
    }
    return Constants.OTP_APPROVED
  }catch (e) {
    throw e;
  }
}

exports.constructActivationMessage = (token) => {
  return `
  Your OTP for registration is ${token}. This will expire in 2 hours
  `;
}

exports.constructPasswordResetMessage = (token) => {
  return `
  Your password reset OTP is ${token}. This will expire in 2 hours
  `;
}

exports.log = async (phoneNumber=null, token=null, expiresIn = null, createResponse=null, verifyResponse=null, action=null, status = "pending") => {
  try {
    await OTPLog.create({
      phoneNumber,
      token,
      expiresIn,
      createResponse,
      action,
      status
    });
  }catch (e) {
    throw e;
  }
}

exports.isExpired = (expiryDateTime) => {
  return TimestampExpiration.check(expiryDateTime);
}

exports.generateToken = () => {
  return Generate.otp(OTP_LENGTH)
}

async function invalidateOTP (otpId) {
  try {
    await OTPLog.update({ status: Constants.OTP_INVALID }, { where: { id: otpId } });
  }catch(err) {
    console.log(err);
  }
}

exports.getExpirationTime = (amount = 2, unit = 'h') => {
  return moment().add(amount, unit).format();
}