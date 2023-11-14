const {Cart, validate} = require("../models/cart");

class CartController {

    async create(req,res) {
        const {error} = validate(req.body);
        if (error) return res.status(400).send({message: error.details[0].message});

        try {
            let cart = await Cart.findOne({ user: req.user._id });

            if (!cart) {
                cart = new Cart({
                    user: req.user._id,
                    cartItems: [
                        {
                            product: req.body.product,
                            quantity: req.body.quantity,
                            price: req.body.price
                        }
                    ]
                });

                await cart.save();
            } else {
                const existingProduct = cart.cartItems.find(
                    (item) => item.product.toString() === req.body.product
                );

                if (existingProduct) {
                    existingProduct.quantity += req.body.quantity;
                    existingProduct.price = req.body.price;
                } else {
                    cart.cartItems.push({
                        product: req.body.product,
                        quantity: req.body.quantity,
                        price: req.body.price
                    });
                }

                await cart.save();
            }

            res.status(201).send(cart);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }

    async getAll(req, res) {

    }

    async getOne(req, res) {

    }

    async delete(req, res) {

    }
}

module.exports = new CartController();