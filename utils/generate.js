require("dotenv").config();

exports.orderNumber = (length = 8) => {
  const str = Math.random().toString(22).substr(2, length);

  const timestamp = new Date();

  const randStr =
    process.env.ORDER_NUMBER_PREFIX +
    str.toUpperCase() +
    "|" +
    timestamp.getTime();
  return randStr;
};

exports.randomString = (length = 8) => {
  const str = Math.random().toString(22).substr(2, length);
  return str;
};

exports.otp = (length = 6) => {
  const str = Math.random().toString(6).substr(2, length);
  return str;
};
