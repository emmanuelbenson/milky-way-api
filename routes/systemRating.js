const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const isAuth = require("../middlewares/is-auth");
const isAdmin = require("../middlewares/is-admin");
const controller = require("../controllers/systemRating");

router.post(
  "/",
  isAuth,
  [
    body("rating").not().isEmpty().withMessage("rating required"),
    body("comment")
      .not()
      .isEmpty()
      .withMessage("comment is required")
      .trim()
      .escape()
      .isLength({ min: 10, max: 150 })
      .withMessage(
        "comment cannot be less than 10 or more than 150 characters"
      ),
  ],
  controller.addRating
);

router.get("/", isAuth, controller.getRating);

router.get("/all", isAuth, isAdmin, controller.getRatings);

router.put(
  "/update",
  isAuth,
  isAdmin,
  [
    body("action")
      .not()
      .isEmpty()
      .withMessage("action is required")
      .trim()
      .escape(),
    body("id")
      .not()
      .isEmpty()
      .withMessage("rating id is required")
      .isInt()
      .withMessage("id must be an integer")
      .trim()
      .escape(),
  ],
  controller.toggleState
);

module.exports = router;
