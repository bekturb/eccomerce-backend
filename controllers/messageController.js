const { Message, validate } = require("../models/message");
const mongoose = require("mongoose");

class MessageController {
  async createMessage(req, res) {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const messageData = req.body;

    messageData.images = req.body.images;
    messageData.conversationId = req.body.conversationId;
    messageData.sender = req.body.sender;
    messageData.text = req.body.text;
    
    const message = new Message({
        conversationId: messageData.conversationId,
        text: messageData.text,
        sender: messageData.sender,
        images: messageData.images ? messageData.images : undefined,
      });

      await message.save();

      res.status(201).send({
        success: true,
        message,
      });
  }

  async getAllMessages(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send("Invalid Id");

    const messages = await Messages.find({
        conversationId: req.params.id,
      });

      res.status(201).send({
        success: true,
        messages,
      });
  }
}

module.exports = new MessageController();
