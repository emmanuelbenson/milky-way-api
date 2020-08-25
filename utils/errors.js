exports.send = (statusCode = 500, message, next) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  next(error);
};
