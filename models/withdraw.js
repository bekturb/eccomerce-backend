const mongoose = require("mongoose");
const Joi = require("joi");

const withdrawSchema = new mongoose.Schema({
    seller: {
        type: Object,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: "Processing",
    },
}, {timestamps: true});


const Withdraw = mongoose.model("Withdraws", withdrawSchema);

function validateWithdraw(withdraw) {
    const schema = Joi.object({
        amount: Joi.number().required()
    });
    return schema.validate(withdraw);
}

exports.Withdraw = Withdraw;
exports.validate = validateWithdraw;
exports.withdrawSchema = withdrawSchema;