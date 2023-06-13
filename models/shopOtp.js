require("dotenv").config();
const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const shopOtpSchema = new mongoose.Schema({
    otp: {
        type: String
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    createdAt: { type: Date, default: Date.now, index: {expires: 300}}
}, {timestamps: true});

shopOtpSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    this.otp = await bcrypt.hash(`${this.otp}`, salt);
    next();
});

const ShopOtp = mongoose.model("ShopOtps", shopOtpSchema);
function validateVerify(req) {
    const schema = Joi.object({
        otp: Joi.string().required(),
    });
    return schema.validate(req);
}

exports.validateVerify = validateVerify;
exports.ShopOtp = ShopOtp;