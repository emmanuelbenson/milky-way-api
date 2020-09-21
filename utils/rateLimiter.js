const rateLimite = require("express-rate-limit");

exports.limiter = rateLimite({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many attempts. Please try again after an hour",
});
