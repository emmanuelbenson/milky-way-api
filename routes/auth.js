const express = require("express");
const router = express.Router();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const User = require("../models/user");
const authController = require("../controllers/auth");

const Status = require("../constants/status");
const ResponseError = require("../constants/responseErrors");

const { body, validatorResult, check, oneOf } = require("express-validator");
const PasswordReset = require("../models/passwordreset");

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     tags:
 *       - Users
 *     name: signup
 *     summary: Signs up a user
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           $ref: '#/definitions/User'
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *             userType:
 *              type: integer
 *              enum: [2000,3000] # 2000 for vendors and 3000 for customer
 *             firstName:
 *              type: string
 *             lastName:
 *              type: string
 *             phoneNumber:
 *              type: string
 *         required:
 *           - email
 *           - password
 *           - userType
 *           - firstName
 *           - lastName
 *           - phoneNumber
 *       - name: source
 *         in: header
 *         schema:
 *          type: string
 *          enum: ['web','mobile']
 *     responses:
 *       200:
 *         description: User created in successfully
 *       400:
 *         description: Request source not specified
 *       422:
 *         description: Validation fields
 */
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("email is required")
      .custom((value, { req }) => {
        return User.findOne({ where: { email: value } }).then((userDoc) => {
          if (userDoc) return Promise.reject("E-mail address already taken");
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 8 }),
    body("phoneNumber").trim().isLength({ min: 11 }),
    body("userType").not().isEmpty().trim().escape(),
    body("firstName").not().isEmpty().trim().escape(),
    body("lastName").not().isEmpty().trim().escape(),
  ],
  authController.signup
);

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     tags:
 *       - Users
 *     name: signin
 *     summary: Signs in a user
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           $ref: '#/definitions/User'
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *         required:
 *           - email
 *           - password
 *       - name: source
 *         in: header
 *         schema:
 *          type: string
 *          enum: ['web','mobile']
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Request source not specified
 *       422:
 *         description: Validation fields
 */
router.post(
  "/signin",
  [
    body("email").not().isEmpty().trim().escape(),
    body("password").not().isEmpty().trim().escape(),
  ],
  authController.signin
);

router.post(
  "/reset-password",
  [
    body("email")
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("email is required")
      .trim()
      .escape()
      .custom((value, { req }) => {
        return User.findOne({ where: { email: value } }).then((userDoc) => {
          if (!userDoc) return Promise.reject("We do not have such record");
        });
      })
      .normalizeEmail(),
  ],
  authController.resetPassword
);

router.post(
  "/password-reset",
  [
    body("token")
      .not()
      .isEmpty()
      .withMessage("Invalid request")
      .trim()
      .escape()
      .custom((value, { req }) => {
        return PasswordReset.findOne({ where: { token: value } }).then(
          (passwordResetDoc) => {
            if (!passwordResetDoc) {
              return Promise.reject("Invalid password reset token");
            } else if (passwordResetDoc.dataValues.status === Status.EXPIRED) {
              return Promise.reject(ResponseError.TOKEN_EXPIRED);
            }
          }
        );
      }),
  ],
  authController.passwordReset
);

module.exports = router;
