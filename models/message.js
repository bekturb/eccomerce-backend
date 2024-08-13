const mongoose = require("mongoose");
const Joi = require("joi");

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

function validateMessage(message){
    const schema = Joi.object({
        conversationId: Joi.string(),
        text: Joi.string().trim(),
        sender: Joi.string(),
    });
    return schema.validate(message)
}

exports.Message = Message;
exports.validate = validateMessage;
exports.messageSchema = messageSchema;