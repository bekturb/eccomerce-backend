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
    banner: {
        type: String,
        required: true,
    },

    sale: {
        type: Number
    },

    navigateTo: {
        type: String,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});


const Page = mongoose.model('Page', pageSchema);

function validatePage(page) {
    const schema = Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        suggestion: Joi.string().required(),
        banner: Joi.string().required(),
        sale: Joi.number(),
        navigateTo: Joi.string(),
        category: Joi.string().required(),
    });
    return schema.validate(page);
}

exports.Page = Page;
exports.validate = validatePage;
exports.pageSchema = pageSchema;