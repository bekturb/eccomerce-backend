const { Conversation } = require("../models/conversation");
const { Message } = require("../models/message");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

class MessageController {
  async createMessage(req, res) {
    ``;
    const senderId = req.user._id;
    let { receiverId, text, images } = req.body;

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
        lastMessage: text,
        lastMessageId: senderId,
      });
    } else {
      conversation.lastMessage = text;
      conversation.lastMessageId = senderId;
    }

    if (images) {
      const myCloud = await cloudinary.uploader.upload(images, {
        folder: "messages",
      });

      images = {
        public_id: myCloud.public_id,
        url: myCloud.url,
      };
    }

    const message = new Message({
      conversationId: conversation._id,
      text: text,
      sender: senderId,
      receiver: receiverId,
      images: images ? images : undefined,
    });

    await Promise.all([conversation.save(), message.save()]);

    res.status(201).send({
      success: true,
      message,
      conversation,
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

  async seenMessages(req, res) {
    const  receiverId = req.user._id;
    const senderId = req.params.receiverId;

    if (!mongoose.Types.ObjectId.isValid(receiverId))
      return res.status(404).send("Invalid Id");

    let conversation = await Conversation.findOne({
      members: { $all: [receiverId, senderId] },
    });

    if (!conversation) return res.status(400).send("Not found conversation");

    await Message.updateMany(
      { conversationId: conversation._id, receiver: receiverId, seen: false },
      { $set: { seen: true } }
    );

    const updatedMessages = await Message.find({conversationId: conversation._id});

    res.status(201).send({
      success: true,
      messages: updatedMessages,
    });
  }
}

module.exports = new MessageController();
