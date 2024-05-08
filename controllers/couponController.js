const {Coupon, validate} = require("../models/coupon");
const mongoose = require("mongoose");

class CouponController {

    async create(req, res) {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const isCouponCodeExists = await Coupon.find({
            name: req.body.name,
        });

        if (isCouponCodeExists.length !== 0) {
            return res.status(400).send("Coupon code already exists!")
        }

        let coupon = new Coupon(req.body);
        coupon = await coupon.save();
        res.status(201).send(coupon)
    }

    async getAll(req, res) {
        const coupons = await Coupon.find().sort("name");
        res.send(coupons)
    }

    async getOne(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let coupon = await Coupon.find({ shopId: req.user._id });
        if (!coupon) return res.status(404).send("No coupon for the given Id");

        res.status(201).send(coupon);
    }

    async getCouponValue(req, res) {
        let coupon = await Coupon.findOne({ name: req.params.name });
        if (!coupon) return res.status(404).send("No coupon for the given name");

        res.status(201).send(coupon);
    }
    
    async delete(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon)
            return res.status(404).send("No coupon for the given Id");
        res.send(coupon)
    }
}

module.exports = new CouponController();