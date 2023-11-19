require("dotenv").config()
const mongoose = require("mongoose");
const Joi = require("joi");

const accountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
}, {timestamps: true});

const Account = mongoose.model("Account", accountSchema);

function validateAccount(account) {
    const schema = Joi.object({
        email: Joi.string().required().email(),
    });

    return schema.validate(account);
}

exports.Account = Account;
exports.validate = validateAccount;
exports.accountSchema = accountSchema;
