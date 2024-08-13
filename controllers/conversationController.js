const { Conversation, validate } = require("../models/conversation");
const mongoose = require("mongoose");

class ConversationController {
  async createConversation(req, res) {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send("Invalid Id");

    const conversations = await Conversation.find({
      members: {
        $in: [req.params.id],
      },
    }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(201).send({
      success: true,
      conversations,
    });
  }

  async getUserConversations(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send("Invalid Id");

    const conversations = await Conversation.find({
      members: {
        $in: [req.params.id],
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
