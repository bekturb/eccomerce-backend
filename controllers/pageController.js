const {Page, validate} = require("../models/page");
const {Category} = require("../models/category");

class ProductController {

    async create(req, res) {

        try {

            const {error} = validate(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            const category = await Category.findById(req.body.category)
            if (!category)
                return res.status(400).send("Not found category");

            req.body.navigateTo = `/bannerClicked?categoryId=${req.body.category}&sale=${req.body.sale || 0}`;
            req.body.createdBy = req.user._id;

            let page = await Page.findOne({category: req.body.category});

            if (page) {
                page = await Page.findOneAndUpdate({category: req.body.category}, req.body, {new: true});
                return res.status(201).send({page});
            } else {
                page = new Page(req.body);
                page = await page.save();
                return res.status(201).send(page);
            }
        } catch (error) {
            return res.status(400).send({error: error.message});
        }
    }

    async getPage(req, res) {
        try {
            const page = await Page.find();

            if (page) {
                return res.status(200).send(page);
            } else {
                return res.status(404).send("Page not found");
            }

        } catch (error) {
            return res.status(400).send({error: error.message});
        }
    }
}

module.exports = new ProductController();