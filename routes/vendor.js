const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const isAuth = require("../middlewares/is-auth");
const isVendor = require("../middlewares/is-vendor");
const controller = require("../controllers/vendorTransaction");

router.get("/", isAuth, isVendor, controller.getTransactions);

module.exports = router;
