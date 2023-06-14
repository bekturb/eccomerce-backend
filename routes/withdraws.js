const express = require('express');
const router = express.Router();
const withdrawController = require('../controllers/withdrawController');
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");

router.post("/create", [auth, seller], withdrawController.create);

module.exports = router;