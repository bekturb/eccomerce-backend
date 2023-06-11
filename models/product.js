const mongoose = require("mongoose");
const Joi = require("joi");

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
       type: String,
       required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    offer: {
        type: Number,
    },
    stock: {
        type: String,
        required: true
    },
    images: [
        {
            type: Array,
            required: true
        }
    ],
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            star: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            postedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        }
    ],
    totalRating: {
        type: String,
        default: 0,
    },
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true},
    information: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
    },
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
}, {timestamps: true});

const Product = mongoose.model("Products", productSchema);

function validateProject(project) {
    const schema = Joi.object({
        name: Joi.string().trim().required(),
        slug: Joi.string().trim(),
        price: Joi.number().required(),
        description: Joi.string().required().min(10),
        brand: Joi.string().required(),
        offer: Joi.number(),
        quantity: Joi.number(),
        stock: Joi.string().required(),
        images: Joi.array().min(1).required(),
        numOfReviews: Joi.number(),
        reviews: Joi.array(),
        totalRating: Joi.string(),
        category: Joi.string().required(),
        information: Joi.object(),
        createdBy: Joi.string(),
    });
    return schema.validate(project);
}

exports.Product = Product;
exports.validate = validateProject;
exports.productSchema = productSchema;