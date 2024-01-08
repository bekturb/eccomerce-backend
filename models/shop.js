const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your shop name!"],
    },
    email: {
        type: String,
        required: [true, "Please enter your shop email address"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Password should be greater than 6 characters"],
    },
    address: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        default: "Seller",
    },
    avatar: {
        type: String,
        required: true,
    },
    zipCode: {
        type: Number,
        required: true,
    },
    withdrawMethod: {
        type: Object,
    },
    availableBalance: {
        type: Number,
        default: 0,
    },
    transactions: [
        {
            amount: {
                type: Number,
                required: true,
            },
            status: {
                type: String,
                default: "Processing",
            },
            createdAt: {
                type: Date,
                default: Date.now(),
            },
            updatedAt: {
                type: Date,
            },
        },
    ],
    verified: {
       type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

shopSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY);
    return token;
};
const Shop = mongoose.model("Shop", shopSchema);

function validateShop(user) {
    const schema = Joi.object({
        name: Joi.string().trim().required(),
        email: Joi.string().required().email(),
        password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .onlyLatinCharacters()
            .required(),
        phoneNumber: Joi.number(),
        address: Joi.string().required(),
        avatar: Joi.string().required(),
        zipCode: Joi.number().required(),
        followers: Joi.array(),
    });

    return schema.validate(user);
}

exports.Shop = Shop;
exports.validateShop = validateShop;
exports.shopSchema = shopSchema;