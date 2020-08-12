require("dotenv").config();
const { validationResult } = require("express-validator");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const SendError = require("../utils/errors");
const responseSuccess = require("../constants/responseSuccess");

const addressMgr = require("../services/addressManager");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    SendError.send(422, "Validation fields", errors, next);
  }
};

const newAddress = async (req, res, next) => {
  const addressData = {};
  addressData.street = req.body.street;
  addressData.lga = req.body.lga;
  addressData.state = req.body.state;
  addressData.longitude = req.body.lng;
  addressData.latitude = req.body.lat;

  const userId = req.userId;

  let saveResponse;
  try {
    saveResponse = await addressMgr.save(userId, addressData);
  } catch (err) {
    console.log("ERR: ", err);
    throw err;
  }

  console.log(saveResponse);

  return saveResponse;
};

exports.add = async (req, res, next) => {
  validate(req, res, next);

  const addressData = {};
  addressData.street = req.body.street;
  addressData.lga = req.body.lga;
  addressData.state = req.body.state;
  addressData.longitude = req.body.lng;
  addressData.latitude = req.body.lat;

  const userId = req.userId;

  let foundAddress;

  try {
    foundAddress = await addressMgr.findByUserId(userId);
  } catch (err) {
    console.log(err);
    throw err;
  }

  if (foundAddress) {
    const data = {
      message: "You already have an address",
    };

    res.status(403).json(data);
  }

  let saveResponse;
  try {
    saveResponse = await addressMgr.save(userId, addressData);
  } catch (err) {
    console.log("ERR: ", err);
    throw err;
  }

  if (saveResponse) {
    const data = {
      message: "Address successfully added",
    };
    res.status(201).json(data);
  }
};

exports.update = async (req, res, next) => {
  validate(req, res, next);

  const updateFields = {};
  const userId = req.body.userId;

  let findResponse;

  try {
    findResponse = await addressMgr.findByUserId(userId);
  } catch (err) {
    console.log(err);
    throw err;
  }

  if (findResponse) {
    updateFields.street = req.body.street
      ? req.body.street
      : findResponse.street;
    updateFields.lga = req.body.lga ? req.body.lga : findResponse.lga;
    updateFields.state = req.body.state ? req.body.state : findResponse.state;
    updateFields.lng = req.body.lng ? req.body.lng : findResponse.longitude;
    updateFields.lat = req.body.lat ? req.body.lat : findResponse.latitude;

    let updateResponse;

    try {
      updateResponse = await addressMgr.update(userId, updateFields);
    } catch (err) {
      console.log(err);
      throw err;
    }

    const data = {
      message: "Address updated",
    };
    res.status(200).json(data);
  } else {
    return null;
  }
};

exports.find = async (req, res, next) => {
  validate(req, res, next);

  const UUId = req.query.q;

  let foundAddress;

  try {
    foundAddress = await addressMgr.findByUUId(UUId);
  } catch (err) {
    console.log(err);
    next(err);
  }

  if (foundAddress) {
    const data = foundAddress;
    res.status(200).json(data);
  } else {
    res
      .status(404)
      .json({ message: "Address not found for this user", data: [] });
  }
};
