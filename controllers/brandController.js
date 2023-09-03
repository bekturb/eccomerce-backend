const {Brand, validate} = require("../models/brand");
const slugify = require("slugify");
const mongoose = require("mongoose");

class BrandController {

    async create(req, res) {

        const {error} = validate(req.body);
        if (error) return res.status(400).send({message: error.details[0].message})

        const brandObj = {
            name: req.body.name,
            slug: slugify(req.body.name),
            brandImage: req.body.categoryImage
        }

        if (req.body.parentCategory) {
            brandObj.parentCategory = req.body.parentCategory
        }

        try {
            const brand = new Brand(brandObj);
            const savedBrand = await brand.save();
            res.status(201).send(savedBrand);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getBrands (req,res) {
        const brands = await Brand.find().sort("name");
        res.status(200).send(brands)
    }

    async updateBrand(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const brandObj = {
            name: req.body.name,
            slug: slugify(req.body.name),
            brandImage: req.body.categoryImage
        }

        if (req.body.parentCategory) {
            brandObj.parentCategory = req.body.parentCategory
        }

        let brand = await Brand.findByIdAndUpdate(req.params.id, brandObj, {
            new: true
        });

        if (!brand)
            return res.status(404).send("No category for the given Id");
        res.send(brand)
    }
}

module.exports = new BrandController()