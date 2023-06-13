require("dotenv").config()
const mongoose = require("mongoose");
const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 20
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 20
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    hash_password: {
        type: String,
        required: true,
        unique: false,
        minLength: 8
    },
    phoneNumber: {
        type: Number
    },
    profilePicture: {
        type: String
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    addresses:[
        {
            country: {
                type: String,
            },
            city:{
                type: String,
            },
            address1:{
                type: String,
            },
            address2:{
                type: String,
            },
            zipCode:{
                type: Number,
            },
            addressType:{
                type: String,
            },
        }
    ],
    wishList: [{type: mongoose.Schema.Types.ObjectId, ref: "Projects"}],
}, {timestamps: true});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY);
    return token;
};

const User = mongoose.model("users", userSchema);

function validateUser(user) {
    const schema = Joi.object({
        firstName: Joi.string().trim().min(3).max(20).required(),
        lastName: Joi.string().trim().min(3).max(20).required(),
        email: Joi.string().required(),
        hash_password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .onlyLatinCharacters()
            .required(),
        phoneNumber: Joi.number(),
        role: Joi.string().valid("user", "admin"),
        profilePicture: Joi.string(),
    });

    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
exports.userSchema = userSchema;
