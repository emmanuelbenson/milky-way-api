const GasStation = require("../models/gas_station");

const User = require("../models/user");

exports.all = async () => {
  let stations;

  try {
    stations = await GasStation.findAll();
  } catch (err) {
    console.log(err);
    throw err;
  }

  return stations;
};

exports.add = async (obj = {}) => {
  let createResponse;

  try {
    createResponse = await GasStation.create(obj);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return createResponse;
};

exports.find = async (id) => {
  let found;
  let stationOwner;

  try {
    found = await GasStation.findByPk(id);
  } catch (err) {
    throw err;
  }

  return found;
};

exports.findByUserId = async (userId) => {
  let station;

  try {
    station = await GasStation.findOne({ where: { userId } });
  } catch (err) {
    throw err;
  }

  return station;
};

exports.update = async (id, fields = {}) => {
  let updateResponse;
  try {
    updateResponse = await GasStation.update(fields, {
      where: { id },
    });
  } catch (err) {
    throw err;
  }

  return updateResponse;
};
