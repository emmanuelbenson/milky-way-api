require("dotenv").config();
const { validationResult } = require("express-validator");
// const Status = require("../constants/status");
const responseSuccess = require("../constants/responseSuccess");

const serviceMgr = require("../services/vendorServiceManager");
const addressMgr = require("../services/addressManager");

exports.registerService = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation fields");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const userId = req.userId;

  let userAddress;
  addressMgr
    .findByUserId(userId)
    .then((address) => {
      if (!address) {
        const error = new Error("User address validation");
        error.statusCode = 404;
        error.data = [
          {
            msg: "This user does not seem to have an address",
            param: "",
            location: "",
          },
        ];
        throw error;
      } else {
        userAddress = address.dataValues;

        const data = {}; // userId, title, amount, userAddressId, status
        data.userId = userId;
        data.title = req.body.title;
        data.amount = req.body.amount;
        data.addressId = userAddress.id;

        serviceMgr
          .register(userId, data)
          .then((result) => {
            if (result) {
              res
                .status(201)
                .json({ message: "Service registered successfully" });
            }
          })
          .catch((err) => {
            const error = new Error("Validation fields");
            const errors = err.errors[0];
            delete errors.origin;
            delete errors.instance;
            error.statusCode = 422;
            error.data = errors;

            next(error);
          });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateService = async (req, res, next) => {
  const updateFields = {};
  const userId = req.userId;
  const serviceId = req.body.serviceId;
  if (!req.body.serviceId) {
    const error = new Error("Vendor service validation");
    error.statusCode = 404;
    error.data = [
      {
        msg: "service ID is required",
        param: "serviceId",
        location: "body",
      },
    ];

    next(error);
  }

  const foundService = await serviceMgr.findByIDAndUserID(serviceId, userId);

  if (foundService) {
    updateFields.status = req.body.status
      ? req.body.status
      : foundService.status;
    updateFields.title = req.body.title ? req.body.title : foundService.title;
    updateFields.amount = parseFloat(req.body.amount)
      ? req.body.amount
      : foundService.amount;

    foundService.title = updateFields.title;
    foundService.status = updateFields.status;
    foundService.amount = updateFields.amount;
  } else {
    const error = new Error("Vendor service validation");
    error.statusCode = 404;
    error.data = [
      {
        msg: "Service not found",
        param: "",
        location: "",
      },
    ];
    next(error);
  }

  try {
    const updateResponse = await serviceMgr.updateService(foundService);

    console.log("RES: ", updateResponse);

    res.status(201).json({
      message: "Service update was successful",
    });
  } catch (err) {
    next(err);
  }
};
