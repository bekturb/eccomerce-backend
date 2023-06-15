const {Event, validateEvent} = require("../models/event");
const slugify = require("slugify");
const {Category} = require("../models/category");
const {Shop} = require("../models/shop");
const mongoose = require("mongoose");
const Joi = require("joi");
const {User} = require("../models/user");

class EventController {
    async create(req,res) {

        const {error} = validateEvent(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const categoryId = await Category.findById(req.body.category)
        if (!categoryId)
            return res.status(400).send("Not found category");

        const shop = await Shop.findById(req.body.shopId)
        if (!shop)
            return res.status(400).send("Not found shop");

        const {name, originalPrice, discountPrice, description, brand, tags, color, quantity, stock, images, category, shopId, start_Date, finish_Date, status} = req.body

        try {
            let event = new Event({
                name: name,
                slug: slugify(name),
                description,
                category,
                brand,
                tags,
                start_Date,
                finish_Date,
                status,
                originalPrice,
                discountPrice,
                color,
                quantity,
                stock,
                images,
                shop: shop,
                shopId
            });
            let savedEvent = await event.save();
            res.status(201).send(savedEvent);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getAll(req, res) {
        const events = await Event.find().sort("name");
        res.send(events)
    }

    async getOne(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send("No event for the given Id");

        res.send(event)
    }

    async update(req,res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validateEvent(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const categoryId = await Category.findById(req.body.category)
        if (!categoryId)
            return res.status(400).send("Not found category");

        const shop = await Shop.findById(req.body.shopId)
        if (!shop)
            return res.status(400).send("Not found shop");

        const {name, originalPrice, discountPrice, description, brand, tags, color, quantity, stock, images, category, shopId, start_Date, finish_Date, status} = req.body

        try {
            let event = await Event.findByIdAndUpdate(req.params.id,
                {
                    name: name,
                    slug: slugify(name),
                    description,
                    category,
                    brand,
                    tags,
                    start_Date,
                    finish_Date,
                    status,
                    originalPrice,
                    discountPrice,
                    color,
                    quantity,
                    stock,
                    images,
                    shop: shop,
                    shopId
                },{ new: true });

            if (!event)
                return res.status(404).send("No event for the given Id");

            let savedEvent = await event.save();
            res.status(201).send(savedEvent);
        } catch (error) {
            res.status(400).send(error);
        }
    }
    async delete(req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let event = await Event.findByIdAndRemove(req.params.id);
        if (!event)

            return res.status(404).send("No event for the given Id");
        res.send(event)
    }
}

module.exports = new EventController();