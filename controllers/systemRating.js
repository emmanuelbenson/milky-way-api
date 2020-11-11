const Status = require("../constants/status");
const Error = require("../utils/errors");
const ValidateInputs = require("../utils/validateInputs");

const SystemRatingManager = require("../services/systemRatingManager");

exports.addRating = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const userId = req.userId;
  const { rating, comment } = req.body;
  let userRating;

  try {
    userRating = await SystemRatingManager.userRating(userId);
  } catch (err) {
    throw err;
  }

  if (userRating) {
    return Error.send(403, "You have already added your rating", [], next);
  }

  try {
    await SystemRatingManager.rate(userId, rating, comment);
    res.status(201).json({ status: "success", message: "Rating added" });
  } catch (err) {
    throw err;
  }
};

exports.getRating = async (req, res, next) => {
  const userId = req.userId;
  let rating;

  try {
    rating = await SystemRatingManager.userRating(userId);
    if (!rating) {
      return Error.send(
        404,
        "You do not have rating for this system",
        [],
        next
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
      },
    });
  } catch (err) {
    throw err;
  }
};

exports.getRatings = async (req, res, next) => {
  let ratings;

  try {
    ratings = await SystemRatingManager.ratings();
    if (!ratings) {
      return Error.send(
        404,
        "You do not have rating for this system",
        [],
        next
      );
    }

    let allRatings = ratings.map((rating) => {
      return {
        id: rating.id,
        userId: rating.userId,
        rating: rating.rating,
        comment: rating.comment,
        status: rating.status,
        createdAt: "2020-08-30T09:07:42.000Z",
      };
    });

    let averageRating,
      totalRatings = 0;

    ratings.forEach((rating) => {
      totalRatings = totalRatings + rating.rating;
    });

    averageRating = totalRatings / ratings.length;

    res.status(200).json({
      status: "success",
      data: allRatings,
      averageRating: averageRating.toFixed(1),
    });
  } catch (err) {
    throw err;
  }
};

exports.toggleState = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);
  const validStatus = [Status.BLOCK, Status.UNBLOCK];
  const { id, action } = req.body;

  if (!validStatus.includes(action)) {
    return Error.send(403, "Invalid action", [], next);
  }

  let rating, newState, stateAction;
  try {
    rating = await SystemRatingManager.find(id);
  } catch (err) {
    throw err;
  }

  if (!rating) {
    return Error.send(404, "Rating not found", [], next);
  }

  try {
    newState = action === Status.BLOCK ? 0 : 1;
    stateAction = action === Status.BLOCK ? Status.BLOCKED : Status.UNBLOCKED;
    await SystemRatingManager.updateStatus(id, newState);
  } catch (err) {
    throw err;
  }

  res
    .status(201)
    .json({ status: "success", message: `Rating ${stateAction} successfully` });
};
