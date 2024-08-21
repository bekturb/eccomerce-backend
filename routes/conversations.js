const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");

router.post("/create", ConversationController.createConversation);
router.get("/get-seller-conversations", [auth, seller], ConversationController.getSellerConversations);
router.get("/get-user-conversations", [auth],  ConversationController.getUserConversations);
router.put("/update-last-message/:id", ConversationController.updateLastMessage);

module.exports = router;