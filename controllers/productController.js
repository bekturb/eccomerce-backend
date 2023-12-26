const {Product, validate} = require("../models/product");
const slugify = require("slugify");
const {Category} = require("../models/category");
const {Shop} = require("../models/shop");
const mongoose = require("mongoose");
const Joi = require("joi");
const {User} = require("../models/user");
const {Brand} = require("../models/brand");
const {findCategoryIdByCategoryName, findBrandByName, generateVendorCode} = require("../helper/data");

class ProductController {
    async create(req, res) {

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const categoryId = await Category.findById(req.body.category)
        if (!categoryId)
            return res.status(400).send("Not found category");

        const brandId = await Brand.findById(req.body.brand)
        if (!brandId)
            return res.status(400).send("Not found brand");

        const shop = await Shop.findById(req.body.shopId)
        if (!shop)
            return res.status(400).send("Not found shop");

        const vendorCode = await generateVendorCode();

        const {name, description, brand, category, tags, variants, shopId, stock, anotherNewField,} = req.body
        const totalQuantity = variants.reduce((sum, variant) => sum + variant.quantity, 0);

        try {
            let product = new Product({
                name: name,
                slug: slugify(name),
                description,
                category,
                brand,
                tags,
                vendorCode,
                totalQuantity,
                stock,
                variants,
                shop: shop,
                shopId,
                anotherNewField,
            });
            let savedProduct = await product.save();
            res.status(201).send(savedProduct);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async addDiscountPrice (req, res) {
        try {

            const saleSchema = Joi.object({
                startDate: Joi.date().required(),
                endDate: Joi.date().required(),
                salePercentage: Joi.number().required(),
            });

            const {error} = saleSchema.validate(req.body);
            if (error)
                return res.status(400).send({message: error.details[0].message});

            const productId = req.params.id;
            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).send("Product not found");
            }

            product.startDate = req.body.startDate;
            product.endDate = req.body.endDate;
            product.salePercentage = req.body.salePercentage;

            product.variants.forEach((variant) => {
                const newDiscountPrice = (variant.originalPrice * (100 - req.body.salePercentage)) / 100;
                variant.discountPrice = newDiscountPrice;
            });

            const updatedProduct = await product.save();

            res.status(200).send(updatedProduct);
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

        let product = await Product.findById(req.params.id).populate('brand');
        if (!product) return res.status(404).send("No project for the given Id");

        res.send(product)
    }

    async update(req, res) {

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const categoryId = await Category.findById(req.body.category)
        if (!categoryId)
            return res.status(400).send("Not found category");

        if (!brandId)
            return res.status(400).send("Not found brand");

        const shop = await Shop.findById(req.body.shopId)
        if (!shop)
            return res.status(400).send("Not found shop");

        const {
            name,
            description,
            brand,
            category,
            tags,
            variants,
            shopId,
            stock,
            anotherNewField,
        } = req.body

        const totalQuantity = variants.reduce((sum, variant) => sum + variant.quantity, 0);

        try {
            let product = await Product.findByIdAndUpdate(req.params.id,
                {
                    name: name,
                    slug: slugify(name),
                    description,
                    category,
                    brand,
                    tags,
                    totalQuantity,
                    stock,
                    variants,
                    shop: shop,
                    shopId,
                    anotherNewField,
                }, {new: true});

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

    async createProductReview(req, res) {
        const validateReview = Joi.object({
            star: Joi.number(),
            title: Joi.string(),
            comment: Joi.string(),
            productId: Joi.string().required()
        });

        const {error} = validateReview.validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        const {star, title, comment, productId} = req.body;

        const review = {
            star: Number(star),
            title,
            comment,
            postedBy: req.user._id,
        };

        const product = await Product.findById(productId)
        if (!product)
            return res.status(400).send("Not found product");

        const user = await User.findById(req.user._id)
        if (!user)
            return res.status(400).send("Not found user");

        let alreadyRated = await product.reviews.find(
            (rev) => rev.postedBy.toString() === req.user._id.toString()
        );

        if (alreadyRated) {
            product.reviews.forEach((rev) => {
                if (rev.postedBy.toString() === req.user._id.toString())
                    (rev.star = star), (rev.title = title), (rev.comment = comment);
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

        await product.save({validateBeforeSave: false});

        const response = {
            star: Number(star),
            title,
            comment,
            postedBy: {
                _id: user._id,
                firstName: user.firstName
            },
            postedDate: new Date(),
        }

        res.status(200).send(response);
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

    async deleteReview(req, res) {
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

    async searchProducts (req, res) {

        try {
            const { key } = req.params;

            const productByVendorCode = await Product.findOne({ vendorCode: parseInt(key) || 0 });

            if (productByVendorCode) {
                res.status(200).send({
                    products: productByVendorCode,
                    foundBy: "vendorCode"
                });
            } else {
                const results = await Product.find({
                    $or: [
                        { name: { $regex: key, $options: 'i' } },
                        { categoryId: await findCategoryIdByCategoryName(key) },
                        { brand: await findBrandByName(key) },
                    ],
                });

                res.status(200).send({
                    products: results,
                    foundBy: "other"
                });
            }
        } catch (error) {
            res.status(500).send('Unexpected error on server!');
        }
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
                }).populate("wishList");
            res.status(201).send(user.wishList)
        } else {
            let user = await User.findByIdAndUpdate(_id, {
                    $push: {wishList: prodId},
                },
                {
                    new: true,
                }).populate("wishList");
            res.status(201).send(user.wishList)
        }
    }
    async getPersonalWishList(req, res) {
        const {_id} = req.user;

        console.log(_id, "_id")

        const user = await User.findById(_id).populate('wishList');
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.status(200).send(user.wishList);
    }
}

module.exports = new ProductController();