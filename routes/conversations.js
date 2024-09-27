const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");

router.get("/get-seller-conversations", [auth, seller], ConversationController.getSellerConversations);
router.get("/get-user-conversations", [auth],  ConversationController.getUserConversations);
router.get("/get-conversation/:receiverId", [auth],  ConversationController.getConversation);

module.exports = router;