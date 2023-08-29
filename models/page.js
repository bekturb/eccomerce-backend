const mongoose = require('mongoose');
const Joi = require("joi");

const pageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    suggestion: {
        type: String,
        trim: true
    },
    banners: [
        {
            img: { type: String },
            navigateTo: { type: String },
        }
    ],
    products: [
        {
            img: { type: String },
            navigateTo: { type: String }
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true ,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
}, { timestamps: true });


const Page = mongoose.model('Page', pageSchema);

function validatePage(page) {
    const schema = Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        suggestion: Joi.string().required(),
        banners: Joi.array().min(1).required(),
        products: Joi.array(),
        category: Joi.string().required(),
        createdBy: Joi.string().required(),
    });
    return schema.validate(page);
}

exports.Page = Page;
exports.validate = validatePage;
exports.pageSchema = pageSchema;