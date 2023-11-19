const mongoose = require("mongoose");
const Joi = require("joi");

const orderSchema = new mongoose.Schema({
    cart:{
        type: Array,
        required: true,
    },
    shippingAddress:{
        type: Object,
        required: true,
    },
    user:{
        type: Object,
        required: true,
    },
    totalPrice:{
        type: Number,
        required: true,
    },
    status:{
        type: String,
        default: "Processing",
    },
    paymentInfo:{
        id:{
            type: String,
        },
        status: {
            type: String,
        },
        type:{
            type: String,
        },
    },
    paidAt:{
        type: Date,
        default: Date.now(),
    },
    deliveredAt: {
        type: Date,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    },
});

const Order = mongoose.model("Order", orderSchema);

function validateOrder(req) {
    const schema = Joi.object({
        cart: Joi.array().required(),
        shippingAddress: Joi.object().required(),
        user: Joi.object().required(),
        totalPrice: Joi.number().required(),
        paymentInfo: Joi.object(),
    });

    return schema.validate(req);
}

exports.Order = Order;
exports.validate = validateOrder;
exports.orderSchema = orderSchema;