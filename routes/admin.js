const express = require("express");
const router = express.Router();

const { body, validatorResult, check, oneOf } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middlewares/is-auth");
const isAdmin = require("../middlewares/is-admin");

router.post(
  "/activate-user",
  [
    isAuth,
    isAdmin,
    body("uuid").not().isEmpty().withMessage("account uuid is required"),
  ],
  adminController.activateAccount
);

module.exports = router;
