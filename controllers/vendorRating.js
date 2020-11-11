const Status = require("../constants/status");
const Error = require("../utils/errors");
const ValidateInputs = require("../utils/validateInputs");

const VendorRatingManager = require("../services/vendorRatingManager");

// Customer rates a vendor
exports.addRating = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);

  const customerId = req.userId;

  const { rating, comment, vendorId, orderId } = req.body;

  let rated;

  try {
    rated = await VendorRatingManager.getRatingByCustomerVendorAndOrderId(
      customerId,
      vendorId,
      orderId
    );
  } catch (err) {
    console.log(err);
    throw err;
  }

  if (rated.length > 0) {
    return Error.send(
      403,
      "You have already rated vendor for this service",
      [],
      next
    );
  }

  try {
    await VendorRatingManager.rate(
      customerId,
      vendorId,
      orderId,
      rating,
      comment
    );
    res.status(201).json({ status: "success", message: "Rating added" });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Vendor views all ratings
exports.getCustomersRatings = async (req, res, next) => {
  ValidateInputs.validate(req, res, next);
  const { vendorId } = req.body;

  let ratings;

  try {
    ratings = await VendorRatingManager.getCustomersRatings(vendorId);
    if (ratings.length < 1) {
      return Error.send(404, "There are no ratings yet.", [], next);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }

  let averageRating = 0;
  let totalRatings = 0;

  ratings.forEach((rating) => {
    totalRatings = totalRatings + rating.rating;
  });

  averageRating = totalRatings / ratings.length;

  res.status(200).json({
    status: "success",
    data: { ratings, averageRating: averageRating.toFixed(1) },
  });
};

exports.getRatings = async (req, res, next) => {
  let ratings;

  try {
    ratings = await VendorRatingManager.ratings();
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
    console.log(err);
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
    rating = await VendorRatingManager.find(id);
  } catch (err) {
    throw err;
  }

  if (!rating) {
    return Error.send(404, "Rating not found", [], next);
  }

  try {
    newState = action === Status.BLOCK ? 0 : 1;
    stateAction = action === Status.BLOCK ? Status.BLOCKED : Status.UNBLOCKED;
    await VendorRatingManager.updateStatus(id, newState);
  } catch (err) {
    throw err;
  }

  res
    .status(201)
    .json({ status: "success", message: `Rating ${stateAction} successfully` });
};
