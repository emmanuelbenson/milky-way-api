const moment = require("moment");

exports.check = (expiryDateTime) => {
  expiryDateTime = moment(expiryDateTime).subtract(1, 'h').format();

  return moment(expiryDateTime).isSameOrBefore(moment().format());
};
