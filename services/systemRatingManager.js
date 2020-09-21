const SystemRating = require("../models/systemRating");

const Status = require("../constants/status");

exports.rate = async (userId, rating, comment) => {
  try {
    await SystemRating.create({
      userId: userId,
      rating: rating,
      comment: comment,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }

  return true;
};

exports.find = async (id) => {
  let rating;

  try {
    rating = await SystemRating.findOne({
      where: { id: id },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }

  return rating;
};

exports.userRating = async (userId) => {
  let rating;

  try {
    rating = await SystemRating.findOne({
      where: { userId: userId },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }

  return rating;
};

exports.ratings = async () => {
  let ratings;

  try {
    ratings = SystemRating.findAll();
  } catch (err) {
    console.log(err);
    throw err;
  }

  return ratings;
};

exports.updateStatus = async (id, newStatus) => {
  let response;
  try {
    response = await SystemRating.update(
      { status: newStatus },
      { where: { id: id } }
    );
  } catch (err) {
    console.log(err);
    throw err;
  }

  return response;
};
