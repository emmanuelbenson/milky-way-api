const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const controller = require("../controllers/gasStation");
const isAuth = require("../middlewares/is-auth");
const isVendor = require("../middlewares/is-vendor");

router.get("/", isAuth, controller.getAll);

router.post(
  "/",
  isAuth,
  isVendor,
  [
    body("lat").not().isEmpty().withMessage("lat is required").trim().escape(),
    body("lng").not().isEmpty().withMessage("lng is required").trim().escape(),
    body("name")
      .not()
      .isEmpty()
      .withMessage("station name is required")
      .trim()
      .escape(),
    body("hours")
      .not()
      .isEmpty()
      .withMessage("working hours is required. E.g 10am - 6pm")
      .isString()
      .trim()
      .escape(),
    body("phone")
      .not()
      .isEmpty()
      .withMessage("business contact is required")
      .trim()
      .escape(),
    body("amount")
      .not()
      .isEmpty()
      .withMessage("amount per kg is required")
      .isNumeric()
      .trim()
      .escape(),
  ],
  controller.add
);

router.get("/:id", isAuth, controller.getStation);
router.get("/my-station", isAuth, controller.getStationByUserId);
router.post("/:id", isAuth, isVendor, controller.updateStation);

module.exports = router;
