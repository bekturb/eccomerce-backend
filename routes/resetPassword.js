const express = require('express');
const router = express.Router();
const PasswordResetController = require('../controllers/passwordResetController')

router.post("/", PasswordResetController.postEmail);
router.post("/:id/verify", PasswordResetController.verify);

module.exports = router;