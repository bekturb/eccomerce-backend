const { Category } = require('../models/category');
const { Brand } = require('../models/brand');

async function findCategoryIdByCategoryName(categoryName) {
    try {
        const category = await Category.findOne({ name: categoryName });
        return category ? category._id : null;
    } catch (error) {
        console.error('Error finding categoryId by category name:', error);
        return null;
    }
}

async function findBrandByName(brandName) {
    try {
        const brand = await Brand.findOne({ name: brandName });
        return brand ? brand._id : null;
    } catch (error) {
        console.error('Error finding brand by name:', error);
        return null;
    }
}

module.exports = {
    findCategoryIdByCategoryName,
    findBrandByName,
};