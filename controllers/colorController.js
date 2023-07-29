const {validateColor, Color} = require("../models/color");
const slugify = require("slugify");
const mongoose = require("mongoose");

class ColorController {
    async create(req, res) {

        const {error} = validateColor(req.body);
        if (error) return res.status(400).send({message});

        const {title} = req.body

        try {
            let color = new Color({
                title: title,
                slug: slugify(title),
            });
            let savedColor = await color.save();
            res.status(201).send(savedColor);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getAll(req, res) {
        const colors = await Color.find().sort("title");
        res.send(colors)
    }

    async getOne(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let color = await Color.findById(req.params.id);
        if (!color) return res.status(404).send("No color for the given Id");

        res.send(color)
    }

    async update(req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validateColor(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const {title} = req.body

        try {
            let color = await Color.findByIdAndUpdate(req.params.id,
                {
                    title,
                    slug: slugify(title),
                }, {new: true});

            if (!color)
                return res.status(404).send("No project for the given Id");

            let savedColor = await color.save();
            res.status(201).send(savedColor);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async delete(req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let color = await Color.findByIdAndRemove(req.params.id);
        if (!color)

            return res.status(404).send("No color for the given Id");
        res.send(color)
    }
}

module.exports = new ColorController();