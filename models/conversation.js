const mongoose = require("mongoose");
const Joi = require("joi");

const conversationSchema = new mongoose.Schema({
    groupTitle: {
        type: String,
    },
    members: {
        type: Array,
    },
    lastMessage: {
        type: String,
    },
    lastMessageId: {
        type: String,
    },

},
{ timestamps: true });

const Converstion = mongoose.model("Conversation", conversationSchema);

function validateConversation(conv){
    const schema = Joi.object({
        groupTitle: Joi.string().required(),
        members: Joi.array(),
        lastMessage: Joi.string().trim(),
        lastMessageId: Joi.string()
    });

    return schema.validate(conv);
}

exports.Converstion = Converstion;
exports.validate = validateConversation;
exports.conversationSchema = conversationSchema;