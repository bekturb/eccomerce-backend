const mongoose = require("mongoose");
const Joi = require("joi");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    brand: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    tags: [String],
    vendorCode: {
        type: Number,
        required: true,
        length: 9
    },
    variants: [
        {
            color: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Color',
                required: true,
            },
            originalPrice: {
                type: Number,
                required: true
            },
            discountPrice: {
                type: Number,
            },
            quantity: {
                type: Number,
                required: true,
            },
            sold: {
                type: Number,
                required: true,
                default: 0,
            },
            specificAttributes: {
               type: mongoose.Schema.Types.Mixed,
            },
            images: [
                {
                    url: String,
                    public_id: String,
                },
            ],
        }
    ],
    totalQuantity: {
        type: Number,
        required: true,
    },
    shopId: {
        type: String,
        required: true,
    },
    shop: {
        type: Object,
        required: true,
    },
    totalSold: {
        type: Number,
        required: true,
        default: 0,
    },
    stock: String,
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            star: {
                type: Number,
                default: 0
            },
            title: {
                type: String,
            },
            comment: {
                type: String,
            },
            postedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            postedDate: {
                type: Date,
                default: Date.now,
            }
        },
    ],
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    salePercentage: {
        type: Number,
    },
    totalRating: {
        type: Number,
        default: 0,
    },
    anotherNewField: {
        type: mongoose.Schema.Types.Mixed,
    },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

function validateProject(project) {
    const schema = Joi.object({
        name: Joi.string().required().trim(),
        description: Joi.string().trim(),
        brand: Joi.string().required(),
        category: Joi.string().required(),
        tags: Joi.array().items(Joi.string()),
        vendorCode: Joi.number(),
        variants: Joi.array().items(
            Joi.object({
                color: Joi.string().required(),
                originalPrice: Joi.number().required(),
                discountPrice: Joi.number(),
                quantity: Joi.number().required(),
                sold: Joi.number().default(0),
                specificAttributes: Joi.any(),
                images: Joi.array().required(),
                _id: Joi.string(),
            })
        ),
        totalQuantity: Joi.number(),
        shopId: Joi.string(),
        shop: Joi.object(),
        sold: Joi.number().default(0),
        stock: Joi.string(),
        numOfReviews: Joi.number().default(0),
        reviews: Joi.array().items(
            Joi.object({
                star: Joi.number(),
                title: Joi.string(),
                comment: Joi.string(),
                postedBy: Joi.string(),
            })
        ),
        totalRating: Joi.number().default(0),
        anotherNewField: Joi.any(),
    });
    return schema.validate(project);
}

exports.Product = Product;
exports.validate = validateProject;
exports.productSchema = productSchema;