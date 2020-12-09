require("dotenv").config;
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_ID,
  TWILIO_PHONE_NUMBER
} = process.env;
const Client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const config = require("../../../config/config.json");

const PHONE_CODE = config.phonecode.NGN;

exports.sendSms = async (message, phoneNumber) => {
    phoneNumber = preparePhoneNumber(phoneNumber, PHONE_CODE)
  return Client.api.messages
      .create({
        body: message,
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER
      })
      .then(data => console.log(phoneNumber + ' notified'))
      .catch(err => {
        throw  err;
      })
}

exports.send = async (phoneNumber, channel = "sms") => {
  phoneNumber = preparePhoneNumber(phoneNumber, PHONE_CODE);

  return await Client.verify
      .services(TWILIO_SERVICE_ID)
      .verifications.create({
        to: phoneNumber,
        channel: channel,
      });
};

exports.verify = async (phoneNumber, token) => {
  phoneNumber = preparePhoneNumber(phoneNumber, PHONE_CODE);

  let response;

  try {
    response = await Client.verify
      .services(TWILIO_SERVICE_ID)
      .verificationChecks.create({
        to: phoneNumber,
        code: token,
      });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

function removeFirstDigitIfZero(phoneNumber) {
  if (phoneNumber.charAt(0) === "0") {
    phoneNumber = phoneNumber.replace(phoneNumber.charAt(0), "");
  }
  return phoneNumber;
}

function appendCountryPhoneCode(phoneNumber, phoneCode) {
  return phoneCode + phoneNumber;
}

function preparePhoneNumber(phoneNumber, phoneCode) {
  phoneNumber = removeFirstDigitIfZero(phoneNumber);
  phoneNumber = appendCountryPhoneCode(phoneNumber, phoneCode);
  return phoneNumber;
}
