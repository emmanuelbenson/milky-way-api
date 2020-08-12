exports.send = (statusCode = 500, message, data = [], next) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  next(error);
  return;
};
