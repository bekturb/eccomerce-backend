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
        required: true,
        trim: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    tags: [String],
    variants: [
        {
            color: String,
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
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            postedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        }
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
        description: Joi.string().required().trim(),
        brand: Joi.string().required(),
        category: Joi.string().required(),
        tags: Joi.array().items(Joi.string()),
        variants: Joi.array().items(
            Joi.object({
                color: Joi.string(),
                originalPrice: Joi.number(),
                quantity: Joi.number().required(),
                sold: Joi.number().default(0),
                specificAttributes: Joi.any(),
                images: Joi.array().items(
                    Joi.object({
                        url: Joi.string(),
                        public_id: Joi.string(),
                    })
                ),
            })
        ),
        totalQuantity: Joi.number(),
        shopId: Joi.string().required(),
        shop: Joi.object(),
        sold: Joi.number().default(0),
        stock: Joi.string(),
        numOfReviews: Joi.number().default(0),
        reviews: Joi.array().items(
            Joi.object({
                star: Joi.number().required(),
                comment: Joi.string().required(),
                postedBy: Joi.string().required(),
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