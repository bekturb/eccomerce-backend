const slugify = require("slugify");
const mongoose = require("mongoose");
const {Color, validate} = require("../models/color");

class ColorController {
    async create(req, res) {

        const {error} = validate(req.body);
        if (error) return res.status(400).send({message: error.details[0].message})

        const colorObj = {
            name: req.body.name,
            slug: slugify(req.body.name),
            hex: req.body.hex,
        }

        try {
            const color = new Color(colorObj);
            const saveColor = await color.save();
            res.status(201).send(saveColor);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getColors (req,res) {
        const colors = await Color.find().sort("name");
        res.status(200).send(colors)
    }

    async getColor (req,res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let color = await Color.findById(req.params.id);
        if (!color) return res.status(404).send("No color for the given Id");

        res.send(color)
    }

    async updateColor(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const colorObj = {
            name: req.body.name,
            slug: slugify(req.body.name),
            hex: req.body.hex,
        }

        let color = await Color.findByIdAndUpdate(req.params.id, colorObj, {
            new: true
        })
        if (!color)
            return res.status(404).send("No color for the given Id");
        res.send(color)
    }
}

module.exports = new ColorController()