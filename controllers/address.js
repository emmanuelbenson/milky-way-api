require("dotenv").config();
const ValidateInput = require("../utils/validateInputs");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const Error = require("../utils/errors");
const responseSuccess = require("../constants/responseSuccess");

const addressMgr = require("../services/addressManager");

exports.add = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const { street, lga, state, lng, lat } = req.body;

  const userId = req.userId;

  let foundAddress;

  try {
    foundAddress = await addressMgr.findByUserId(userId);
  } catch (err) {
    console.log(err);
    Error.send(500, "Internal server error", [], next);
  }

  if (foundAddress) {
    Error.send(403, "You already have an address", [], next);
  }

  let saveResponse;

  try {
    saveResponse = await addressMgr.save(userId, street, lga, state, lat, lng);
  } catch (err) {
    console.log(err);
    Error.send(500, "Internal server error", [], next);
  }

  res.status(201).json({
    status: "success",
    message: "Address added",
  });
};

exports.update = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const updateFields = {};
  const userId = req.body.userId;

  let foundAddress;

  try {
    foundAddress = await addressMgr.findByUserId(userId);
  } catch (err) {
    console.log(err);
    Error.send(500, "Internal server error", [], next);
  }

  if (!foundAddress) {
    SendError.send(404, "You have no address yet", [], next);
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
    return Error.send(500, "Internal server error", [], next);
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
    return Error.send(500, "Internal server error", [], next);
  }

  if (foundAddress) {
    const data = foundAddress;
    res.status(200).json(data);
  } else {
    return Error.send(404, "Address not found for this user", [], next);
  }
};
