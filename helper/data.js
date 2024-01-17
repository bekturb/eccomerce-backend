const { Category } = require('../models/category');
const { Brand } = require('../models/brand');
const {Product} = require("../models/product");

async function findCategoryIdByCategoryName(categoryName) {
    try {
        const category = await Category.findOne({ name: categoryName });
        return category ? category._id : null;
    } catch (error) {
        console.error('Error finding categoryId by category name:', error);
        return null;
    }
}

const generateVendorCode = async () => {
    let isUnique = false;
    let randomNumber;

    const min = 100000000;
    const max = 999999999;

    while (!isUnique) {

        randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        const existingProduct = await Product.findOne({ vendorCode: randomNumber });

        isUnique = !existingProduct;
    }

    return randomNumber;
};

module.exports = {
    findCategoryIdByCategoryName,
    generateVendorCode
};