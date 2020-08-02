require("dotenv").config();
const { validationResult } = require("express-validator");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const responseSuccess = require("../constants/responseSuccess");

const addressMgr = require("../services/addressManager");

exports.add = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const addressData = {};
  addressData.street = req.body.street;
  addressData.lga = req.body.lga;
  addressData.state = req.body.state;
  addressData.longitude = req.body.lng;
  addressData.latitude = req.body.lat;

  const userId = req.userId;

  addressMgr
    .save(userId, addressData)
    .then((result) => {
      if (result) {
        const msg = "Address added succcessfully";
        res.status(201).json({ message: msg });
      }
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.statusCode = 422;
      delete err.errors[0].instance;
      delete err.errors[0].origin;
      error.data = err.errors;
      next(error);
    });
};

exports.update = (req, res, next) => {
  const updateFields = {};
  const userId = req.userId;

  addressMgr
    .findByUserId(userId)
    .then((found) => {
      if (found) {
        updateFields.street = req.body.street ? req.body.street : found.street;
        updateFields.lga = req.body.lga ? req.body.lga : found.lga;
        updateFields.state = req.body.state ? req.body.state : found.state;
        updateFields.lng = req.body.lng ? req.body.lng : found.longitude;
        updateFields.lat = req.body.lat ? req.body.lat : found.latitude;

        addressMgr
          .update(userId, updateFields)
          .then((updated) => {
            res.status(201).json({
              message: `Address update was ${responseSuccess.SUCCESSFUL}`,
            });
          })
          .catch((err) => {
            console.log(err);
            next(err);
          });
      }
    })
    .catch((err) => {
      throw err;
    });
};
