const mongoose = require("mongoose");
const Joi = require("joi");

const eventSchema = new mongoose.Schema({
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
    salePercentage: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    variants: [
        {
            color: String,
            originalPrice: Number,
            discountPrice: {
                type: Number,
                required: true,
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
            size: Number,
            images: [
                {
                    url: String,
                    public_id: String,
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
    totalRating: {
        type: Number,
        default: 0,
    },
    anotherNewField: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

function validateEvent(event) {
    const schema = Joi.object({
        name: Joi.string().required().trim(),
        description: Joi.string().required().trim(),
        brand: Joi.string().required(),
        category: Joi.string().required(),
        tags: Joi.array().items(Joi.string()),
        salePercentage: Joi.number().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        variants: Joi.array().items(
            Joi.object({
                color: Joi.string(),
                originalPrice: Joi.number(),
                discountPrice: Joi.number().required(),
                quantity: Joi.number().required(),
                images: Joi.array().items(
                    Joi.object({
                        url: Joi.string(),
                        public_id: Joi.string(),
                    })
                ),
                startDate: Joi.date(),
                endDate: Joi.date(),
                salePercentage: Joi.number(),
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
    return schema.validate(event);
}

exports.Event = Event;
exports.validateEvent = validateEvent;
exports.eventSchema = eventSchema;