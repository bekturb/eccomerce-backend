const {Order, validate} = require("../models/order");
const {Shop} = require("../models/shop");
const {Product} = require("../models/product");
const mongoose = require("mongoose");

class OrderController {

    async create(req, res) {
    
        try {
    
            const { error } = validate(req.body);
            if (error) return res.status(400).send(error.details[0].message);
    
            const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;
            const shopItemsMap = new Map();
    
            for (const item of cart) {
                const { shopId } = item;
                if (!shopItemsMap.has(shopId)) {
                    shopItemsMap.set(shopId, []);
                }
                shopItemsMap.get(shopId).push(item);
            }
    
            const orders = [];
            for (const [shopId, items] of shopItemsMap) {
                const order = new Order({
                    cart: items,
                    shippingAddress,
                    user,
                    totalPrice,
                    paymentInfo,
                    shop: shopId,
                });
                await order.save();
                orders.push(order);
            }
                res.status(201).send({
                success: true,
                orders,
            });
        } catch (error) {
            res.status(500).send('Order creation failed');
        }
    }

    async getAll (req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.userId))
            return res.status(404).send("Invalid Id");

        try {
            const orders = await Order.find({ "user._id": req.params.userId }).sort({
                createdAt: -1,
            });

            res.status(200).send({
                success: true,
                orders,
            });
        } catch (error) {
            return res.status(500).send("'Order not found");
        }
    }

    async getSellerOrders (req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.shopId))
            return res.status(404).send("Invalid Id");

        try {
            const orders = await Order.find({ "cart.shopId": req.params.shopId }).sort({createdAt: -1,});

            res.status(200).send(orders);
        } catch (error) {
            return res.status(500).send("'Order not found");
        }
    }

    async updateStatus (req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).send("Order not found with this id");
            }

            if (req.body.status === "Transferred to delivery partner") {
                await Promise.all(
                    order.cart.map(async (o) => {
                        await updateOrder(o.product, o.qty);
                    })
                );
            }

            order.status = req.body.status;

            if (req.body.status === "Delivered") {
                order.deliveredAt = Date.now();
                order.paymentInfo.status = "Succeeded";
                const serviceCharge = order.totalPrice * .10;
                await updateSellerInfo(order.totalPrice - serviceCharge);
            }

            await order.save({ validateBeforeSave: false });

            res.status(200).send({
                success: true,
                order,
            });

            async function updateOrder(id, qty) {
                const product = await Product.findById(id);

                product.quantity -= qty;
                product.sold += qty;

                await product.save({ validateBeforeSave: false });
            }

            async function updateSellerInfo(amount) {
                const seller = await Shop.findById(req.user._id);

                seller.availableBalance = amount;

                await seller.save();
            }
        } catch (error) {
            return res.status(400).send(error.message);
        }
    }

    async orderRefund (req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).send("Order not found with this id");
            }

            order.status = req.body.status;

            await order.save({ validateBeforeSave: false });

            res.status(200).send({
                success: true,
                order,
                message: "Order Refund Request successfully!",
            });
        } catch (error) {
            return res.status(500).send(error.message);
        }
    }

    async orderRefundSuccess (req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).send("Order not found with this id");
            }

            order.status = req.body.status;

            await order.save();

            res.status(200).send({
                success: true,
                message: "Order Refund successfull!",
            });

            if (req.body.status === "Refund Success") {
                await Promise.all(
                    order.cart.map(async (o) => {
                        await updateOrder(o.product, o.qty);
                    })
                );
            }

            async function updateOrder(id, qty) {
                const product = await Product.findById(id);

                product.quantity += qty;
                product.sold -= qty;

                await product.save({ validateBeforeSave: false });
            }
        } catch (error) {
            return res.status(500).send(error.message);
        }
    }

    async getAllAdminOrders (req, res) {
        try {
            const orders = await Order.find().sort({
                deliveredAt: -1,
                createdAt: -1,
            });
            res.status(201).send({
                success: true,
                orders,
            });
        } catch (error) {
            return res.status(500).send(error.message);
        }
    }
}

module.exports = new OrderController();

// for (const item of cart) {
// const product = await Product.findById(item.productId);
// if (!product) {
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).send(`Product with ID ${item.productId} not found`);
// }

// product.totalQuantity -= item.quantity;
// product.totalSold += item.quantity;

// const variant = product.variants.find(v => v._id.toString() === item.variantId);
// if (!variant) {
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).send(`Variant with ID ${item.variantId} not found in product ${product._id}`);
// }

// variant.quantity -= item.quantity;
// variant.sold += item.quantity;

// await product.save({ session });