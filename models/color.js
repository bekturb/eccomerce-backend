const mongoose = require("mongoose");
const Joi = require("joi");
const slugify = require("slugify");

const colorSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Color = mongoose.model("Colors", colorSchema);

function validateColor(project) {
    const schema = Joi.object({
        title: Joi.string().required(),
    });
    return schema.validate(project);
}

exports.Color = Color;
exports.validateColor = validateColor;
exports.colorSchema = colorSchema;
