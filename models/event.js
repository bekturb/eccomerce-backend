const mongoose = require("mongoose");
const Joi = require("joi");

const eventSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Please enter your event product name!"],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
    },
    description:{
        type: String,
        required:[true,"Please enter your event product description!"],
        trim: true,
    },
    brand: {
        type: String,
        required: true
    },
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true},
    tags: [],
    start_Date: {
        type: Date,
        required: true,
    },
    finish_Date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: "Running",
    },
    originalPrice:{
        type: Number,
    },
    discountPrice:{
        type: Number,
        required: [true,"Please enter your event product price!"],
    },
    color: [],
    quantity: {
        type: Number,
        required: true
    },
    shopId:{
        type: String,
        required: true,
    },
    shop:{
        type: Object,
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
    images:[
        {
            url: String,
            public_id: String,
        },
    ],
    createdAt:{
        type: Date,
        default: Date.now(),
    }
});

const Event = mongoose.model("Events", eventSchema);

function validateEvent(event) {
    const schema = Joi.object({
        name: Joi.string().required().trim(),
        description: Joi.string().required().min(10),
        brand: Joi.string().required(),
        category: Joi.string().required(),
        tags: Joi.array(),
        start_Date: Joi.date().required(),
        finish_Date: Joi.date().required(),
        status: Joi.string(),
        originalPrice: Joi.number(),
        discountPrice: Joi.number().required(),
        color: Joi.array(),
        quantity: Joi.number().required(),
        shopId: Joi.string().required(),
        shop: Joi.object(),
        stock: Joi.string().required(),
        images: Joi.array(),
    });
    return schema.validate(event);
}

exports.Event = Event;
exports.validateEvent = validateEvent;
exports.eventSchema = eventSchema;