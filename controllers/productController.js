const {Product, validate} = require("../models/product");
const slugify = require("slugify");
const {Category} = require("../models/category");
const mongoose = require("mongoose");

class ProductController {

    async create(req,res) {

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const categoryId = await Category.findById(req.body.category)
        if (!categoryId)
            return res.status(400).send("Not found category");

        const {name, price, description, brand, offer, quantity, stock, images, numOfReviews, reviews, totalRating, category, information} = req.body

        try {
            let product = new Product({
                name: name,
                slug: slugify(name),
                price,
                description,
                brand,
                offer,
                quantity,
                stock,
                images,
                numOfReviews,
                reviews,
                totalRating,
                category,
                information,
                createdBy: req.user._id,
            });
            let savedProduct = await product.save();
            res.status(201).send(savedProduct);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getAll(req, res) {
        const products = await Product.find().sort("name");
        res.send(products)
    }

    async getOne(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("No project for the given Id");

        res.send(product)
    }

    async update(req,res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const categoryId = await Category.findById(req.body.category)
        if (!categoryId)
            return res.status(400).send("Not found category");

        const {name, price, description, brand, offer, quantity, stock, images, numOfReviews, reviews, totalRating, category, information} = req.body

        try {
            let product = await Product.findByIdAndUpdate(req.params.id,
                {
                name: name,
                slug: slugify(name),
                price,
                description,
                brand,
                offer,
                quantity,
                stock,
                images,
                numOfReviews,
                reviews,
                totalRating,
                category,
                information,
                createdBy: req.user._id,
            },{ new: true });

            if (!product)
                return res.status(404).send("No project for the given Id");

            let savedProduct = await product.save();
            res.status(201).send(savedProduct);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async delete(req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let product = await Product.findByIdAndRemove(req.params.id);
        if (!product)

            return res.status(404).send("No project for the given Id");
        res.send(product)
    }
}

module.exports = new ProductController();