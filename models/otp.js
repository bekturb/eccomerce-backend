require("dotenv").config();
const mongoose = require("mongoose");
const Joi = require("joi");
// const bcrypt = require("bcrypt");

const otpSchema = new mongoose.Schema({
    otp: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: { type: Date, default: Date.now, index: {expires: 300}}
}, {timestamps: true});

// otpSchema.pre("save", async function (next) {
//     const salt = await bcrypt.genSalt(Number(process.env.SALT));
//     this.otp = await bcrypt.hash(`${this.otp}`, salt);
//     next();
// })

const Otp = mongoose.model("otp", otpSchema);
function validateVerify(req) {
    const schema = Joi.object({
        otp: Joi.string().required(),
    });
    return schema.validate(req);
}

exports.validateVerify = validateVerify;

exports.Otp = Otp;