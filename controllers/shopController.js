require("dotenv").config();
const mongoose = require("mongoose");
const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);
const {ShopOtp, validateVerify} = require("../models/shopOtp");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const {Shop, validateShop} = require("../models/shop");
const {validate, User} = require("../models/user");
const {Otp} = require("../models/otp");

class ShopController {

    async getMe(req, res) {
        const shop = await Shop.findById(req.user._id).select("-password");
        res.send(shop);
    }

    async register (req, res) {

        const {error} = validateShop(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        let shop = await Shop.findOne({email: req.body.email});
        if (shop)
            return res.status(400).send('This shop is already exists');

        shop = new Shop({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            description: req.body.description,
            avatar: req.body.avatar,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            zipCode: req.body.zipCode,
        });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        shop.password = await bcrypt.hash(shop.password, salt);

        const OTP = otpGenerator.generate(6, {
            digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });

        await sendEmail(shop.email, "Verify your email", `Your OTP is ${OTP}.\nDo not share with anyone`);
        await ShopOtp.create({otp: OTP, shopId: shop._id});

        shop = await shop.save();
        return res.status(201).send("OTP sent. Valid for only 2 minutes");
    }

    async verify(req, res) {

        const {error} = validateVerify(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        let OTP = await ShopOtp.findOne();
        if (!OTP)
            return res.status(400).send('Invalid OTP number');

        const isMatch = await bcrypt.compare(req.body.otp, OTP.otp);

        if (!isMatch) {
            return res.send("Incorrect OTP or it has been expired.");
        }

        const shop = await Shop.findById(OTP.shopId);
        if (shop) {
            await Shop.findByIdAndUpdate(OTP.shopId, { verified: true });
            await ShopOtp.deleteOne({ _id: OTP._id });
            res.status(200).send(`${shop.email} has been successfully verified`);
        } else {
            res.status(400).send("Incorrect OTP or it has been expired.");
        }
    }
}

module.exports = new ShopController();