const mongoose = require("mongoose");
const Joi = require("joi");

const brandSchema = new mongoose.Schema({

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

    brandImage: {
        type: String,
    },

    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categories',
        },
    ],

}, {timestamps: true});


const Brand = mongoose.model("brands", brandSchema);

function validateBrand(brand) {
    const schema = Joi.object({
        name: Joi.string().required().trim(),
        slug: Joi.string().trim(),
        brandImage: Joi.string(),
        categoryIds: Joi.array()
    });
    return schema.validate(brand)

}

exports.Brand = Brand;
exports.validate = validateBrand;
exports.brandSchema = brandSchema;
