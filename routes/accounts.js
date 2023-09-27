const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/accountController');

router.post("/", AccountController.register);

module.exports = router;