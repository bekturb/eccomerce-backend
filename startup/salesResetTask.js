const cron = require("node-cron");
const {Product} = require("../models/product");

const resetSalesTask = async () => {
    try {
        const currentDate = new Date();
        const products = await Product.find();

        if (!products) {
            console.log("Products not found");
            return;
        }

        products.forEach(async (product) => {
            if (product.endDate && product.endDate < currentDate) {
                product.startDate = null;
                product.endDate = null;
                product.salePercentage = null;

                product.variants.forEach((variant) => {
                    variant.discountPrice = variant.originalPrice;
                });

                await product.save();
                console.log(`Reset sales for product ${product._id}`);
            }
        });
    } catch (error) {
        console.error("Error resetting sales:", error);
    }
};

cron.schedule("0 * * * * *", resetSalesTask);