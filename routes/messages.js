const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const auth = require("../middlewares/auth");

router.post("/create", auth, MessageController.createMessage);
router.get("/get-all-messages/:id", MessageController.getAllMessages);

module.exports = router;