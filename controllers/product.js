require("dotenv").config();
const { validationResult } = require("express-validator");
const Status = require("../constants/status");
const Constants = require("../constants/Constants");
const responseSuccess = require("../constants/responseSuccess");
const SendError = require("../utils/errors");
const ValidateInput = require("../utils/validateInputs");

const ProductManager = require("../services/productManager");
const VendorManager = require("../services/vendorManager");

exports.create = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const product = {
    userId: req.userId,
    name: req.body.name,
    price: req.body.price,
  };

  try {
    newProduct = await ProductManager.create(product);
  } catch (error) {
    console.log(error);
    next(error);
  }

  const response = {
    message: "Product created",
    data: [{ productId: newProduct }],
  };

  res.status(201).json(response);
};

exports.update = async (req, res, next) => {
  ValidateInput.validate(req, res, next);

  const vendorId = req.userId;
  const productId = req.body.productId;

  let foundProduct;
  try {
    foundProduct = await ProductManager.find(productId, vendorId);
  } catch (err) {
    console.log(err);
    next(err);
  }

  if (!foundProduct) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    error.data = [];

    throw error;
  }

  let updateResponse;

  try {
    const updateData = {
      name: req.body.name ? req.body.name : foundProduct.name,
      unitPrice: req.body.price ? req.body.price : foundProduct.unitPrice,
      active: req.body.status !== null ? req.body.status : foundProduct.active,
    };

    updateResponse = await ProductManager.updateProduct(
      vendorId,
      productId,
      updateData
    );
  } catch (err) {
    console.log(err);
    next(err);
  }

  const data = {
    message: "Product updated",
    data: [{ productId: updateResponse[0] }],
  };
  res.status(200).json(data);
};
