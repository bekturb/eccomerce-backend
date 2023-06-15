const {Product, validate} = require("../models/product");
const slugify = require("slugify");
const {Category} = require("../models/category");
const {Shop} = require("../models/shop");
const mongoose = require("mongoose");
const Joi = require("joi");
const {User} = require("../models/user");

class ProductController {

    async create(req,res) {

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const categoryId = await Category.findById(req.body.category)
        if (!categoryId)
            return res.status(400).send("Not found category");

        const shop = await Shop.findById(req.body.shopId)
        if (!shop)
            return res.status(400).send("Not found shop");

        const {name, originalPrice, discountPrice, description, brand, tags, color, quantity, stock, images, category, shopId} = req.body

        try {
            let product = new Product({
                name: name,
                slug: slugify(name),
                description,
                category,
                brand,
                tags,
                originalPrice,
                discountPrice,
                color,
                quantity,
                stock,
                images,
                shop: shop,
                shopId
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

        const shop = await Shop.findById(req.body.shopId)
        if (!shop)
            return res.status(400).send("Not found shop");

        const {name, originalPrice, discountPrice, description, brand, tags, color, quantity, stock, images, category, shopId} = req.body

        try {
            let product = await Product.findByIdAndUpdate(req.params.id,
                {
                name: name,
                slug: slugify(name),
                description,
                category,
                brand,
                tags,
                originalPrice,
                discountPrice,
                color,
                quantity,
                stock,
                images,
                shop: shop,
                shopId
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

    async createProductReview (req, res) {
        const validateReview = Joi.object({
            star: Joi.number().required(),
            comment: Joi.string().required(),
            productId: Joi.string().required()
        });

        const {error} = validateReview.validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        const {star, comment, productId} = req.body;

        const review = {
            star: Number(star),
            comment,
            postedBy: req.user._id,
        };

        const product = await Product.findById(productId)
        if (!product)
            return res.status(400).send("Not found product");

        let alreadyRated = await product.reviews.find(
            (rev) => rev.postedBy.toString() === req.user._id.toString()
        );

        if (alreadyRated) {
            product.reviews.forEach((rev) => {
                if (rev.postedBy.toString() === req.user._id.toString())
                    (rev.star = star), (rev.comment = comment);
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        let avg = 0;

        product.reviews.forEach((rev) => {
            avg += rev.star;
        });

        product.totalRating = avg / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.status(200).send({
            success: true,
        });
    }

    async getAllReviews(req, res) {
        const projectId = req.params.productId;

        const product = await Product.findById(projectId).populate('reviews.postedBy', 'firstName');
        if (!product) {
            return res.status(404).send('Product not found');
        }
        const productReviews = product.reviews
        res.send(productReviews)
    }

    async deleteReview (req, res) {
        const projectId = req.params.productId;
        const reviewId = req.params.reviewId;

        if (!mongoose.Types.ObjectId.isValid(projectId))
            return res.status(404).send("Invalid Id");

        if (!mongoose.Types.ObjectId.isValid(reviewId))
            return res.status(404).send("Invalid Id");

        let product = await Product.findByIdAndRemove(projectId);
        if (!product)
            return res.status(404).send("No project for the given Id");

        const reviews = product.reviews.filter(
            (rev) => rev._id.toString() !== reviewId.toString()
        );

        let avg = 0;

        reviews.forEach((rev) => {
            avg += rev.star;
        });

        let totalRating = 0;

        if (reviews.length === 0) {
            totalRating = 0;
        } else {
            totalRating = avg / reviews.length;
        }

        const numOfReviews = reviews.length;

        await Product.findByIdAndUpdate(
            projectId,
            {
                reviews,
                totalRating,
                numOfReviews,
            },
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        );
        res.status(200).send({
            success: true,
        });
    }

    async addToWishlist(req, res) {
        const {_id} = req.user;
        const prodId = req.body.productId;

        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const alreadyAdded = await user.wishList.find(id => id.toString() === prodId);
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(_id, {
                    $pull: {wishList: prodId},
                },
                {
                    new: true,
                });
            res.status(201).send(user)
        }else{
            let user = await User.findByIdAndUpdate(_id, {
                    $push: {wishList: prodId},
                },
                {
                    new: true,
                });
            res.status(201).send(user)
        }
    }
}

module.exports = new ProductController();