require("dotenv").config();

exports.randomString = (length = 8) => {
  const str = Math.random().toString(22).substr(2, length);

  return str;
};

exports.genOrderNumber = (length = 8) => {
  const genStr = this.randomString(length);

  const timestamp = new Date();

  const randStr =
    process.env.ORDER_NUMBER_PREFIX +
    genStr.toUpperCase() +
    "|" +
    timestamp.getTime();

  return randStr;
};
