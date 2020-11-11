const express = require("express");
const router = express.Router();

const controller = require("../controllers/payment");

router.get("/hook", controller.hook);

module.exports = router;
