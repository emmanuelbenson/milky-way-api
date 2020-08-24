const moment = require("moment");

exports.check = (timestamp) => {
  return timestamp >= moment();
};
