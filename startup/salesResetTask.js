const cron = require("node-cron");
const {Product} = require("../models/product");

const resetSalesTask = async () => {
    try {
        const currentDate = new Date();
        const products = await Product.find({});

        products.forEach((product) => {
            product.variants.forEach((variant) => {
                if (variant.endDate && variant.endDate < currentDate) {
                    variant.startDate = null;
                    variant.endDate = null;
                    variant.salePercentage = null;
                    variant.discountPrice = variant.originalPrice;
                }
            });

            product.save();
        });

        console.log("Sale resets completed.");
    } catch (error) {
        console.error("Error resetting sales:", error);
    }
};

cron.schedule("0 0 * * *", resetSalesTask);