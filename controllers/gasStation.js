require("dotenv").config();
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const gasStationManager = require("../services/gasStationManager");
const Error = require("../utils/errors");
const AuditTrail = require("../services/auditTrailManager");

const ValidateInput = require("../utils/validateInputs");

exports.getAll = async (req, res, next) => {
  let stations;

  try {
    stations = await gasStationManager.all();
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  res.status(200).json({
    status: Status.SUCCESS,
    data: stations,
  });
};

exports.add = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  let userId = req.userId;
  const { lat, lng, logoUrl, hours, phone, name, amount } = req.body;

  const geometry = { type: Constants.GEOMETRY_TYPE, coordinates: [lat, lng] };
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
    return Error.send(500, "Internal server error", [], next);
  }

  res.status(201).json({
    status: Status.SUCCESS,
    message: "Station added",
    data: newStation,
  });
};

exports.getStation = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params;

  let station;

  try {
    station = await gasStationManager.find(id);
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  if (!station) {
    return Error.send(404, "Gas station not found", [], next);
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
    return Error.send(500, "Internal server error", [], next);
  }

  if (!station) {
    return Error.send(404, "Gas station not found", [], next);
  }

  let url, hours, phone, updateResponse;

  const properties = JSON.parse(station.dataValues.properties);
  const geometry = JSON.parse(station.dataValues.geometry);

  const lat = req.body.lat ? req.body.lat : geometry.coordinates[0];
  const lng = req.body.lng ? req.body.lng : geometry.coordinates[1];

  geometry.coordinates = [lat, lng];

  const newGeometry = JSON.stringify(geometry);

  properties.logo = req.body.logo ? req.body.logo : properties.logo;
  properties.hours = req.body.hours ? req.body.hours : properties.hours;
  properties.name = req.body.name ? req.body.name : properties.name;
  properties.phone = req.body.phone ? req.body.phone : properties.phone;

  const newProperties = JSON.stringify(properties);

  const newData = {
    geometry: newGeometry,
    name: req.body.name ? req.body.name : station.dataValues.name,
    amount: req.body.amount ? req.body.amount : station.dataValues.amount,
    properties: newProperties,
  };

  try {
    updateResponse = await gasStationManager.update(id, newData);
  } catch (err) {
    console.log(err);
    return Error.send(500, "Internal server error", [], next);
  }

  if (updateResponse[0] == 1) {
    res.status(200).send({
      status: "success",
      message: "Station updated",
    });
    return;
  }

  return Error.send(
    500,
    "Could not update station at this moment. Please try again later",
    [],
    next
  );
};
