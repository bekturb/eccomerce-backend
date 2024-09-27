const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversationId: {
      type: String,
    },
    text: {
      type: String,
    },
    sender: {
      type: String,
    },
    receiver: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    images: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },
  { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

exports.Message = Message;
exports.messageSchema = messageSchema;