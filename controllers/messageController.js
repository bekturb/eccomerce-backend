const { Message } = require("../models/message");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose");

class MessageController {
  async createMessage(req, res) {

    const messageData = req.body;    

    if (req.body.images) {
      const myCloud = await cloudinary.uploader.upload(req.body.images, {
        folder: "messages",
      });      
            
      messageData.images = {
        public_id: myCloud.public_id,
        url: myCloud.url,
      };
    }

    messageData.conversationId = req.body.conversationId;
    messageData.sender = req.user._id;
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

    const messages = await Message.find({
        conversationId: req.params.id,
      });

      res.status(201).send({
        success: true,
        messages,
      });
  }
}

module.exports = new MessageController();
