const multer = require("multer");
const Clarifai = require("clarifai");
require("dotenv").config();
const { Product, validate } = require("../models/product");
const slugify = require("slugify");
const { Category } = require("../models/category");
const { Shop } = require("../models/shop");
const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("../models/user");
const {
  findCategoryIdByCategoryName,
  generateVendorCode,
} = require("../helper/data");
const initializeClarifai = require("../utils/initializeClarifai");

class ProductController {
  constructor() {
    try {
      this.clarifai = new Clarifai.App({
        apiKey: `${process.env.CLARIFAI_API_KEY}`,
      });
    } catch (error) {
      console.error("Error initializing Clarifai:", error);
    }

    this.storage = multer.memoryStorage();
    this.upload = multer({ storage: this.storage });
  }
  async create(req, res) {
    const shopId = req.user._id;

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const categoryId = await Category.findById(req.body.category);
    if (!categoryId) return res.status(400).send("Not found category");

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(400).send("Not found shop");

    const vendorCode = await generateVendorCode();

    const {
      name,
      description,
      brand,
      category,
      tags,
      variants,
      stock,
      anotherNewField,
    } = req.body;
    const totalQuantity = variants.reduce(
      (sum, variant) => +sum + +variant.quantity,
      0
    );

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

  async addDiscountPrice(req, res) {
    try {
      const saleSchema = Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        salePercentage: Joi.number().required(),
        productIds: Joi.array().items(Joi.string().required()).required(),
      });
  
      const { error } = saleSchema.validate(req.body);
      if (error) return res.status(400).send({ message: error.details[0].message });
  
      const { startDate, endDate, salePercentage, productIds } = req.body;
  
      const updatedProducts = await Promise.all(
        productIds.map(async (productId) => {
          const product = await Product.findById(productId);
  
          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }
  
          product.startDate = startDate;
          product.endDate = endDate;
          product.salePercentage = +salePercentage;
  
          product.variants.forEach((variant) => {
            const newDiscountPrice = (variant.originalPrice * (100 - salePercentage)) / 100;
            variant.discountPrice = newDiscountPrice;
          });
  
          return await product.save();
        })
      );
  
      res.status(200).send(updatedProducts);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }

  async getAll(req, res) {
    const products = await Product.find()
      .sort("name")
      .populate("variants.color", "name hex")
      .exec();
    res.send(products);
  }

  async getShopProducts(req, res) {
    const { shopId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(shopId))
      return res.status(404).send("Invalid Id");

    const products = await Product.find({ shopId: shopId });
    res.status(200).send(products);
  }

  async getOne(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send("Invalid Id");

    let product = await Product.findById(req.params.id)
      .populate({
        path: "category",
        select: "name",
      })
      .populate({
        path: "variants.color",
        select: "name hex",
      })
      .exec();
    if (!product) return res.status(404).send("No project for the given Id");

    res.send(product);
  }

  async getOneForUpdate(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId))
      return res.status(404).send("Invalid Id");

    let product = await Product.findById(req.params.productId)
      .populate({
        path: "category",
        select: "name",
      })
      .exec();
    if (!product) return res.status(404).send("No project for the given Id");

    res.send(product);
  }

  async update(req, res) {
    const sellerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send("Invalid Id");

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const categoryId = await Category.findById(req.body.category);
    if (!categoryId) return res.status(400).send("Not found category");

    const shop = await Shop.findById(sellerId);
    if (!shop) return res.status(400).send("Not found shop");

    const {
      name,
      description,
      brand,
      category,
      tags,
      variants,
      stock,
      anotherNewField,
    } = req.body;

    const totalQuantity = variants.reduce(
      (sum, variant) => +sum + +variant.quantity,
      0
    );

    try {
      let product = await Product.findByIdAndUpdate(
        req.params.id,
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
          shopId: sellerId,
          anotherNewField,
        },
        { new: true }
      );

      if (!product) return res.status(404).send("No project for the given Id");

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
    if (!product) return res.status(404).send("No project for the given Id");
    res.send(product);
  }

  async deleteMultipleProducts(req, res) {
    const { ids } = req.body;

    if (
      !Array.isArray(ids) ||
      !ids.every((id) => mongoose.Types.ObjectId.isValid(id))
    ) {
      return res.status(400).send("Invalid Id(s)");
    }

    try {
      const result = await Product.deleteMany({ _id: { $in: ids } });
      if (result.deletedCount === 0) {
        return res.status(404).send("No products found for the given Id(s)");
      }
      res.status(200).send({result, message: `${result.deletedCount} product(s) deleted`});
    } catch (error) {
      res.status(500).send("Server error");
    }
  }

  async createProductReview(req, res) {
    const validateReview = Joi.object({
      star: Joi.number(),
      title: Joi.string(),
      comment: Joi.string(),
      productId: Joi.string().required(),
    });

    const { error } = validateReview.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const { star, title, comment, productId } = req.body;

    const review = {
      star: Number(star),
      title,
      comment,
      postedBy: req.user._id,
    };

    const product = await Product.findById(productId);
    if (!product) return res.status(400).send("Not found product");

    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Not found user");

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

    await product.save({ validateBeforeSave: false });

    const response = {
      star: Number(star),
      title,
      comment,
      postedBy: {
        _id: user._id,
        firstName: user.firstName,
      },
      postedDate: new Date(),
    };

    res.status(200).send(response);
  }

  async getAllReviews(req, res) {
    const projectId = req.params.productId;

    const product = await Product.findById(projectId).populate(
      "reviews.postedBy",
      "firstName"
    );
    if (!product) {
      return res.status(404).send("Product not found");
    }
    const productReviews = product.reviews;
    res.send(productReviews);
  }

  async deleteReview(req, res) {
    const projectId = req.params.productId;
    const reviewId = req.params.reviewId;

    if (!mongoose.Types.ObjectId.isValid(projectId))
      return res.status(404).send("Invalid Id");

    if (!mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(404).send("Invalid Id");

    let product = await Product.findByIdAndRemove(projectId);
    if (!product) return res.status(404).send("No project for the given Id");

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

  async searchProducts(req, res) {
    const { key } = req.params;

    const productByVendorCode = await Product.findOne({
      vendorCode: parseInt(key) || 0,
    });

    if (productByVendorCode) {
      res.status(200).send({ product: productByVendorCode });
    } else {
      const results = await Product.find({
        $or: [
          { name: { $regex: key, $options: "i" } },
          { category: await findCategoryIdByCategoryName(key) },
          { brand: { $regex: key, $options: "i" } },
          { tags: { $in: [key] } },
        ],
      });
      res.status(200).send({ products: results });
    }
  }

  async searchProductByImage(req, res) {
    const imageBuffer = req.file.buffer;

    const clarifai = initializeClarifai(`${process.env.CLARIFAI_API_KEY}`);

    if (!clarifai) {
      throw new Error("Clarifai initialization failed");
    }

    const clarifaiResponse = await clarifai.models.predict(
      Clarifai.GENERAL_MODEL,
      {
        base64: imageBuffer.toString("base64"),
      }
    );

    const concepts = clarifaiResponse.outputs[0].data.concepts.map(
      (concept) => concept.name
    );

    const query = {
      $or: [
        { "variants.images.url": { $in: concepts } },
        { tags: { $in: concepts } },
        { "category.name": { $in: concepts } },
        { brand: { $in: concepts } },
        { name: { $regex: new RegExp(concepts.join("|"), "i") } },
      ],
    };

    const matchingProducts = await Product.find(query).populate(["category"]);

    res.status(200).send({ products: matchingProducts });
  }

  async addToWishlist(req, res) {
    const { _id } = req.user;
    const prodId = req.body.productId;

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const alreadyAdded = await user.wishList.find(
      (id) => id.toString() === prodId
    );
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishList: prodId },
        },
        {
          new: true,
        }
      ).populate("wishList");
      res.status(201).send(user.wishList);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishList: prodId },
        },
        {
          new: true,
        }
      ).populate("wishList");
      res.status(201).send(user.wishList);
    }
  }

  async getPersonalWishList(req, res) {
    const { _id } = req.user;

    const user = await User.findById(_id).populate("wishList");
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(user.wishList);
  }
}

module.exports = new ProductController();
