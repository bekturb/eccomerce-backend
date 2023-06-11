const {Category, validate} = require("../models/category");
const slugify = require("slugify");
const {createCategories} = require("../utils/createCategories");

class CategoryController {

    async create(req, res) {

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message)

        const categoryObj = {
            name: req.body.name,
            slug: slugify(req.body.name)
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

        if (categories){
            const categoryList = createCategories(categories);
            res.status(200).send(categoryList)
        }
    }
}

module.exports = new CategoryController()