const { Conversation } = require("../models/conversation");

class ConversationController {

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

  async getConversation(req, res) {
    
    const userId = req.user._id;
    const receiverId  = req.params.receiverId;       

    let conversation = await Conversation.findOne({ members: { $all: [userId, receiverId] }});    

    if (!conversation) return res.status(400).send("Not found conversation");

    res.status(201).send({
      success: true,
      conversation,
    });
  }
}

module.exports = new ConversationController();
