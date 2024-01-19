const mongoose = require("mongoose");
const Joi = require("joi");

const colorSchema = new mongoose.Schema({

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

    hex: {
        type: String,
        required: true
    },

}, {timestamps: true});


const Color = mongoose.model("Color", colorSchema);

function validateColor(color) {
    const schema = Joi.object({
        name: Joi.string().required().trim(),
        slug: Joi.string().trim(),
        hex: Joi.string().required().trim(),
    });
    return schema.validate(color)

}

exports.Color = Color;
exports.validate = validateColor;
exports.colorSchema = colorSchema;
