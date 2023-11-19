const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true
    },

    icon: {
        type: String,
    },

    categoryImage: {
        type: String,
    },

    parentId: {
        type: String,
    }

}, {timestamps: true});


const Category = mongoose.model("Category", categorySchema);

function validateCategory(category) {
    const schema = Joi.object({
        name: Joi.string().required().trim(),
        slug: Joi.string().trim(),
        icon: Joi.string(),
        categoryImage: Joi.string(),
        parentId: Joi.string()
    });
    return schema.validate(category)

}

exports.Category = Category;
exports.validate = validateCategory;
exports.categorySchema = categorySchema;
