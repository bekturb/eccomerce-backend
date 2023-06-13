const express = require('express');
const router = express.Router();
const shopAuthController = require('../controllers/shopAuthController')

router.post("/auth", shopAuthController.create)
module.exports = router;