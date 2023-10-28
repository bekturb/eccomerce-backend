const {Category, validate} = require("../models/category");
const slugify = require("slugify");
const {createCategories} = require("../utils/createCategories");
const mongoose = require("mongoose");

class CategoryController {

    async create(req, res) {

        const {error} = validate(req.body);
        if (error) return res.status(400).send({message: error.details[0].message})

        const categoryObj = {
            name: req.body.name,
            slug: slugify(req.body.name),
            icon: req.body.icon,
            categoryImage: req.body.categoryImage
        }

        if (req.body.parentId) {
            categoryObj.parentId = req.body.parentId
        }

        try {
            const cat = new Category(categoryObj);
            const savedCategory = await cat.save();
            res.status(201).send(savedCategory);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getCategories (req,res) {
        const categories = await Category.find().sort("name");
        res.status(200).send(categories)
    }

    async getCategoriesByOrder (req,res) {
        const categories = await Category.find().sort("name");

        if (categories){
            const categoryList = createCategories(categories);
            res.status(200).send(categoryList)
        }
    }

    async getCategory (req,res) {

        const categorySlug = req.params.slug;

        const category = await Category.findOne({ slug: categorySlug });
        if (!category) return res.status(404).send({message: "No category for the given slug"});

        return res.status(200).send(category);
    }

    async update(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const categoryObj = {
            name: req.body.name,
            slug: slugify(req.body.name),
            icon: req.body.icon,
            categoryImage: req.body.categoryImage
        }

        if (req.body.parentId) {
            categoryObj.parentId = req.body.parentId
        }

        let category = await Category.findByIdAndUpdate(req.params.id, categoryObj, {
            new: true
        })
        if (!category)
            return res.status(404).send("No category for the given Id");
        res.send(category)
    }
}

module.exports = new CategoryController()