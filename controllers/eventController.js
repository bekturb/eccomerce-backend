const {Event, validateEvent} = require("../models/event");
const slugify = require("slugify");
const {Category} = require("../models/category");
const {Shop} = require("../models/shop");
const mongoose = require("mongoose");
const {Product} = require("../models/product");

async function calculateDiscountedPrice(variant, salePercentage) {
    const originalPrice = variant.price;
    const discountPrice = originalPrice - (originalPrice * salePercentage / 100);
    return discountPrice;
}

class EventController {
    async create(req,res) {

        try {

            const {error} = validateEvent(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            const { salePercentage, startDate, endDate, selectedVariantIds } = req.body;
            const productId = req.params.productId;

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            const offerProducts = [];
            const updatedVariants = [];
            for (const variantId of selectedVariantIds) {
                const matchingVariantIndex = product.variants.findIndex(variant => variant._id.toString() === variantId);

                if (matchingVariantIndex !== -1) {
                    const matchingVariant = product.variants[matchingVariantIndex];

                    const discountedPrice = calculateDiscountedPrice(matchingVariant, salePercentage);

                    matchingVariant.discountPrice = discountedPrice;

                    const offerProduct = new Event({
                        name: product.name,
                        description: product.description,
                        brand: product.brand,
                        category: product.category,
                        tags: product.tags,
                        variants: [matchingVariant],
                        totalQuantity: matchingVariant.quantity,
                        shopId: product.shopId,
                        shop: product.shop,
                        sold: product.sold,
                        stock: product.stock,
                        numOfReviews: product.numOfReviews,
                        reviews: product.reviews,
                        totalRating: product.totalRating,
                        anotherNewField: product.anotherNewField,
                        salePercentage,
                        startDate,
                        endDate,
                    });

                    offerProducts.push(offerProduct);
                    product.variants.splice(matchingVariantIndex, 1);
                }
            }

            await product.save();

            await Event.insertMany(offerProducts);

            const offer = new Event({
                name: `Offer for ${product.name}`,
                description: `Special offer for ${product.name}`,
                salePercentage,
                startDate,
                endDate,
                products: offerProducts.map(op => op._id), // Include the OfferProduct IDs
            });

            await offer.save();

            return res.status(201).send('OfferProducts and Offer created successfully');
        } catch (error) {
            return res.status(500).send('An error occurred' );
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
            salePercentage,
            startDate,
            endDate,
        } = req.body

        const totalQuantity = variants.reduce((sum, variant) => sum + variant.quantity, 0);
        const updatedVariants = variants.map(variant => {
            const originalPrice = variant.price; // Assuming you have a 'price' field in your variant
            const discountPrice = originalPrice - (originalPrice * salePercentage / 100);
            return { ...variant, discountPrice };
        });

        try {
            let event = await Event.findByIdAndUpdate(req.params.id,
                {
                    name: name,
                    slug: slugify(name),
                    description,
                    category,
                    brand,
                    tags,
                    totalQuantity,
                    stock,
                    variants: updatedVariants,
                    shop: shop,
                    shopId,
                    anotherNewField,
                    salePercentage,
                    startDate,
                    endDate,
                }, {new: true});

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