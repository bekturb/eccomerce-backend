const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
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

const Conversation = mongoose.model("Conversation", conversationSchema);

exports.Conversation = Conversation;
exports.conversationSchema = conversationSchema;