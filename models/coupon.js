require("dotenv").config()
const mongoose = require("mongoose");
const Joi = require("joi");

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        upperCase: true
    },
    expiry: {
        type: Date,
        required: true,
    },
    discount: {
        type: Number,
        required: true
    }
}, {timestamps: true});

const Coupon = mongoose.model("Coupons", couponSchema);

function validateCoupon(user) {
    const schema = Joi.object({
        name: Joi.string().required().uppercase(),
        expiry: Joi.date().required(),
        discount: Joi.number().required()
    });

    return schema.validate(user);
}

exports.Coupon = Coupon;
exports.validate = validateCoupon;
exports.couponSchema = couponSchema;