const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.post("/register", userController.register);
router.post("verify", userController.verify);

module.exports = router;