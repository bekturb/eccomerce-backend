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
    value:{
        type: Number,
        required: true,
    },
    minAmount:{
        type: Number,
    },
    maxAmount:{
        type: Number,
    },
    shopId:{
        type: String,
        required: true,
    },
    selectedProduct:{
        type: String,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
}, {timestamps: true});

const Coupon = mongoose.model("Coupons", couponSchema);

function validateCoupon(user) {
    const schema = Joi.object({
        name: Joi.string().required().uppercase(),
        value: Joi.number(),
        minAmount: Joi.number(),
        maxAmount: Joi.number(),
        shopId: Joi.string(),
        selectedProduct: Joi.string(),
    });

    return schema.validate(user);
}

exports.Coupon = Coupon;
exports.validate = validateCoupon;
exports.couponSchema = couponSchema;