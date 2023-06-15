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
    description: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
       type: String,
       required: true
    },
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true},
    tags: [],
    originalPrice: {
        type: Number,
    },
    discountPrice: {
        type: Number,
        required: [true, "Please enter your product price!"],
    },
    color: [],
    quantity: {
        type: Number,
        required: true
    },
    shopId: {
        type: String,
        required: true,
    },
    shop: {
        type: Object,
        required: true
    },
    sold: {
       type: Number,
       required: true,
       default: 0,
    },
    stock: {
        type: String,
        required: true
    },
    images: [
        {
            url: String,
            public_id: String,
        },
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
            postedBy: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
        }
    ],
    totalRating: {
        type: Number,
        default: 0,
    },
}, {timestamps: true});

const Product = mongoose.model("Products", productSchema);

function validateProject(project) {
    const schema = Joi.object({
        name: Joi.string().trim().required(),
        slug: Joi.string().trim(),
        description: Joi.string().required().min(10),
        category: Joi.string().required(),
        brand: Joi.string().required(),
        tags: Joi.array(),
        originalPrice: Joi.number().required(),
        discountPrice: Joi.number().required(),
        color: Joi.array(),
        quantity: Joi.number(),
        stock: Joi.string().required(),
        images: Joi.array().min(1).required(),
        shop: Joi.object().required(),
        shopId: Joi.string().required(),
    });
    return schema.validate(project);
}

exports.Product = Product;
exports.validate = validateProject;
exports.productSchema = productSchema;