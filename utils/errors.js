exports.send = (statusCode = 500, message, data = [], next) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  delete error.data.parent;
  delete error.data.fields;
  delete error.data.original;
  delete error.data.sql;
  next(error);
};
