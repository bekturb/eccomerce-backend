const express = require('express');
const router = express.Router();
const PageController = require('../controllers/pageController');
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/create", [auth, admin], PageController.create);
router.get("/", PageController.getPage);

module.exports = router;