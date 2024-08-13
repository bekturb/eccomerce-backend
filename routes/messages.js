const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');

router.post("/create", MessageController.createMessage);
router.get("/get-all-messages/:id", MessageController.getAllMessages);

module.exports = router;