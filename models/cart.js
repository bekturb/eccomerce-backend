const mongoose = require("mongoose");
const Joi = require("joi");

const cartSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    cartItems: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, default: 1 },
        }
    ],
    price: { type: Number, required: true },
}, {
    timestamps: true
});

const Cart = mongoose.model("Cart", cartSchema);

function validateCart(project) {
    const schema = Joi.object({
        product: Joi.object().required(),
    });
    return schema.validate(project);
}

exports.Cart = Cart;
exports.validate = validateCart;
exports.cartSchema = cartSchema;