const { Conversation } = require("../models/conversation");
const mongoose = require("mongoose");

class ConversationController {

  async createConversation(req, res) {

    const { groupTitle, userId, sellerId } = req.body;

    const isConversationExist = await Conversation.findOne({ groupTitle });

    if (isConversationExist) {
      const conversation = isConversationExist;
      res.status(201).send({ succes: true, conversation });
    } else {
      const conversation = new Conversation({
        members: [userId, sellerId],
        groupTitle,
      });
      const savedConv = await conversation.save();
      res.status(201).send(savedConv);
    }
  }

  async getSellerConversations(req, res) {

    const sellerId = req.user._id

    const conversations = await Conversation.find({
      members: {
        $in: [sellerId],
      },
    }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(201).send({
      success: true,
      conversations,
    });
  }

  async getUserConversations(req, res) {
    
    const userId = req.user._id

    const conversations = await Conversation.find({
      members: {
        $in: [userId],
      },
    }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(201).send({
      success: true,
      conversations,
    });
  }

  async updateLastMessage(req, res) {
    const { lastMessage, lastMessageId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
        lastMessage,
        lastMessageId,
      });

      res.status(201).send({
        success: true,
        conversation,
      });
  }
}

module.exports = new ConversationController();
