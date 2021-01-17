require("dotenv").config();
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const gasStationManager = require("../services/gasStationManager");
const Error = require("../utils/errors");
const Errors = require("../libs/errors/errors");
const UtilError = require("../utils/errors");
const { validationResult } = require("express-validator");

exports.getAll = async (req, res, next) => {
  let stations;

  try {
    stations = await gasStationManager.all();
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  const features = stations.map((station) => {
    return {
      geometry: JSON.parse(station.geometry),
      type: station.type,
      properties: JSON.parse(station.properties),
      storeId: station.id,
    };
  });

  const data = {
    type: "FeatureCollection",
    features: features,
  };

  res.status(200).json({
    status: Status.SUCCESS,
    data,
  });
};

exports.add = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new Errors.UnprocessableEntity(errors));
    return;
  }

  let userId = req.userId;
  const { lat, lng, logoUrl, hours, phone, name, amount } = req.body;

  try {
    const found = await gasStationManager.findByUserId(userId);
    if (found) {
      next(
        new Errors.Forbidden(
          UtilError.parse(null, "You already have a station", null, null)
        )
      );
      return;
    }
  } catch (error) {}

  const geometry = {
    type: Constants.GEOMETRY_TYPE,
    coordinates: [parseFloat(lng), parseFloat(lat)],
  };
  const type = Constants.MAP_STATION_TYPE;
  const properties = {
    logo: logoUrl,
    hours: hours,
    name: name,
    phone: phone,
  };

  let newStation;

  const data = {
    userId,
    name,
    amount,
    measureUnit: Constants.MEASURE_UNIT,
    geometry: JSON.stringify(geometry),
    type,
    properties: JSON.stringify(properties),
  };

  try {
    newStation = await gasStationManager.add(data);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  res.status(201).json({
    status: Status.SUCCESS,
    message: "Station added",
    data: newStation,
  });
};

exports.getStationByUserId = async (req, res, next) => {
  const userId = req.userId;

  let station;

  try {
    station = await gasStationManager.findByUserId(userId);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (!station) {
    next(
      new Errors.NotFound(
        UtilError.parse(null, "Gas station not found", null, "body")
      )
    );
    return;
  }

  res.status(200).json(station);
};

exports.getStation = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params;

  let station;

  try {
    station = await gasStationManager.find(id);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (!station) {
    next(
      new Errors.NotFound(
        UtilError.parse(null, "Gas station not found", null, "body")
      )
    );
    return;
  }

  res.status(200).json(station);
};

exports.updateStation = async (req, res, next) => {
  const { id } = req.params;
  let station;

  try {
    station = await gasStationManager.find(id);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (!station) {
    next(
      new Errors.NotFound(
        UtilError.parse(null, "Gas station not found", null, "body")
      )
    );
    return;
  }

  let updateResponse;
  const p = JSON.parse(station.properties);

  const properties = JSON.stringify({
    logo: p.logo,
    hours: req.body.hours ? req.body.hours : p.hours,
    name: p.name,
    phone: req.body.phone ? req.body.phone : p.phone,
  });

  const newData = {
    amount: req.body.amount ? req.body.amount : station.dataValues.amount,
    properties: properties,
  };

  console.log(newData);

  try {
    updateResponse = await gasStationManager.update(id, newData);
  } catch (err) {
    console.log(err);
    next(new Errors.GeneralError());
    return;
  }

  if (updateResponse[0] == 1) {
    res.status(200).send({
      status: "success",
      message: "Station updated",
    });
    return;
  }

  res.status(500).send({
    status: "success",
    message: "Could not update station at this moment. Please try again later",
  });
};
