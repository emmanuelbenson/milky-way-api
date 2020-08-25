const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const addressController = require("../controllers/address");
const isAuth = require("../middlewares/is-auth");

/**
 * @swagger
 * /api/v1/address:
 *   post:
 *     tags:
 *       - Address Management
 *     name: Add New Address
 *     summary: Adds new address
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           $ref: '#/definitions/Address'
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             lga:
 *               type: string
 *             state:
 *               type: string
 *             lng:
 *               type: string
 *             lat:
 *               type: string
 *         required:
 *           - street
 *           - lga
 *           - state
 *           - lng
 *           - lat
 *       - name: source
 *         in: header
 *         schema:
 *          type: string
 *          enum: ['web','mobile']
 *     responses:
 *       '200':
 *         description: Address added
 *       '403':
 *         description: You already have an address.
 *       '400':
 *         description: Request source not specified
 *       '422':
 *         description: Validation fields
 */
router.post(
  "/",
  isAuth,
  [
    body("street")
      .not()
      .isEmpty()
      .withMessage("street field is required")
      .trim()
      .escape(),
    body("lga")
      .not()
      .isEmpty()
      .withMessage("lga field is required")
      .trim()
      .escape(),
    body("state")
      .not()
      .isEmpty()
      .withMessage("state field is required")
      .trim()
      .escape(),
    body("lng")
      .not()
      .isEmpty()
      .withMessage("longitude field is required")
      .trim()
      .escape(),
    body("lat")
      .not()
      .isEmpty()
      .withMessage("latitude field is required")
      .trim()
      .escape(),
  ],
  addressController.add
);

router.post(
  "/update",
  isAuth,
  [
    body("userId")
      .not()
      .isEmpty()
      .withMessage("user ID required")
      .trim()
      .escape(),
  ],
  addressController.update
);

router.get("/search", isAuth, addressController.find);

module.exports = router;
