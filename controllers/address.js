require("dotenv").config();
const ValidateInput = require("../utils/validateInputs");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const Errors = require("../libs/errors/errors");
const UtilError = require("../utils/errors");
const { validationResult } = require("express-validator");

const addressMgr = require("../services/addressManager");

exports.add = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new Errors.UnprocessableEntity(errors));
    return;
  }

  const { street, lga, state, lng, lat } = req.body;

  const userId = req.userId;

  let foundAddress;

  try {
    foundAddress = await addressMgr.findByUserId(userId);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (foundAddress) {
    next(
      new Errors.BadRequest(
        UtilError.parse("", "You already have an address", "", "")
      )
    );
    return;
  }

  let saveResponse;

  try {
    saveResponse = await addressMgr.save(userId, street, lga, state, lat, lng);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  res.status(201).json({
    status: "success",
    message: "Address added",
  });
};

exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new Errors.UnprocessableEntity(errors));
    return;
  }

  const updateFields = {};
  const userId = req.body.userId;

  let foundAddress;

  try {
    foundAddress = await addressMgr.findByUserId(userId);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (!foundAddress) {
    SendError.send(404, "You have no address yet", [], next);
    next(
      new Errors.NotFound(
        UtilError.parse(null, "You have no address yet", null, "body")
      )
    );
    return;
  }

  updateFields.street = req.body.street ? req.body.street : foundAddress.street;
  updateFields.lga = req.body.lga ? req.body.lga : foundAddress.lga;
  updateFields.state = req.body.state ? req.body.state : foundAddress.state;
  updateFields.longitude = req.body.lng ? req.body.lng : foundAddress.longitude;
  updateFields.latitude = req.body.lat ? req.body.lat : foundAddress.latitude;

  try {
    await addressMgr.update(userId, updateFields);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  const data = {
    status: "success",
    message: "Address updated",
  };
  res.status(200).json(data);
};

exports.find = async (req, res, next) => {
  const UUId = req.query.q;

  let foundAddress;

  try {
    foundAddress = await addressMgr.findByUUId(UUId);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (foundAddress) {
    const data = foundAddress;
    res.status(200).json(data);
  } else {
    next(
      new Errors.NotFound(
        UtilError.parse(
          null,
          "Address was not found for this user",
          null,
          "body"
        )
      )
    );
    return;
  }
};
