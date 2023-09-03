const {Brand, validate} = require("../models/brand");
const slugify = require("slugify");
const mongoose = require("mongoose");
const {Category} = require("../models/category");

class BrandController {

    async create(req, res) {

        try {

            const {error} = validate(req.body);
            if (error) return res.status(400).send({message: error.details[0].message})

            const { name, brandImage, categoryIds } = req.body;

            const brandObj = {
                name,
                slug: name,
                brandImage,
            }

            const brand = new Brand(brandObj);

            const categories = await Category.find({ _id: { $in: categoryIds } });

            brand.categories = categories.map(category => category._id);

            const savedBrand = await brand.save();
            res.status(201).send(savedBrand);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getBrands(req, res) {
        const brands = await Brand.find().sort("name");
        res.status(200).send(brands)
    }

    async updateBrand(req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const { name, brandImage, categoryIds } = req.body;

        const brandObj = {
            name,
            slug: name,
            brandImage,
        }

        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).send({ error: 'Brand not found' });
        }

        brand.name = name || brand.name;
        brand.slug = name || brand.slug;
        brand.brandImage = brandImage || brand.brandImage;

        const categories = await Category.find({ _id: { $in: categoryIds } });

        brand.categories = categories.map(category => category._id);

        await brand.save();

        res.send(brand)
    }
}

module.exports = new BrandController()