const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const isAuth = require("../middlewares/is-auth");
const isAdmin = require("../middlewares/is-admin");
const controller = require("../controllers/transactionLimit");

router.post(
  "/",
  isAuth,
  isAdmin,
  [
    body("type").not().isEmpty().withMessage("type required").trim().escape(),
    body("period")
      .not()
      .isEmpty()
      .withMessage("period required")
      .trim()
      .escape(),
    body("limit").not().isEmpty().withMessage("limit required").trim().escape(),
  ],
  controller.add
);

router.get("/", isAuth, isAdmin, controller.getAll);

router.get("/:id", isAuth, isAdmin, controller.getById);

router.get("/type/:type", isAuth, isAdmin, controller.getByType);

router.put(
  "/update",
  isAuth,
  isAdmin,
  [body("id").not().isEmpty().withMessage("id required").trim().escape()],
  controller.update
);

module.exports = router;
