const { Product } = require('../models/product');

async function updateProductQuantities(cart) {
    try {
        for (const item of cart) {

            const product = await Product.findById(item.productId);
            if (!product) {
                res.status(500).send(`Product with ID ${item.productId} not found`);
            }

            product.totalQuantity -= item.quantity;
            product.totalSold += item.quantity

            const variant = product.variants.find(v => v._id.toString() === item.variantId);
            if (!variant) {
                res.status(500).send(`Variant with ID ${item.variantId} not found in product ${product._id}`);
            }

            variant.quantity -= item.quantity;
            variant.sold -= item.quantity;
            
            await product.save();
        }
    } catch (error) {
        res.status(500).send('Error updating product quantities:', error);
    }
}

module.exports = { updateProductQuantities };