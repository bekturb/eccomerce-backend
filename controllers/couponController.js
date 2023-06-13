const {Coupon, validate} = require("../models/coupon");
const mongoose = require("mongoose");

class CouponController {

    async create(req, res) {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message)

        let coupon = new Coupon({
            name: req.body.name,
            expiry: req.body.expiry,
            discount: req.body.discount
        });
        coupon = await coupon.save();
        res.status(201).send(coupon)
    }

    async getAll(req, res) {
        const coupons = await Coupon.find().sort("name");
        res.send(coupons)
    }

    async update(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let coupon = await Coupon.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            expiry: req.body.expiry,
            discount: req.body.discount
        }, {
            new: true
        })
        if (!coupon)
            return res.status(404).send("No coupon for the given Id");
        res.send(coupon)
    }

    async delete(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");
        let coupon = await Coupon.findByIdAndRemove(req.params.id);
        if (!coupon)
            return res.status(404).send("No coupon for the given Id");
        res.send(coupon)
    }
}

module.exports = new CouponController();