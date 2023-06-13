require("dotenv").config();
const mongoose = require("mongoose");
const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);
const {ShopOtp, validateVerify} = require("../models/shopOtp");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const Shop = require("../models/shop");
const {validate, User} = require("../models/user");

class ShopController {

    async register (req, res) {
        const {error} = validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        let shop = await Shop.findOne({email: req.body.email});
        if (shop)
            return res.status(400).send('This shop is already exists');

        shop = new Shop({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
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
        await ShopOtp.create({otp: OTP, userId: shop._id});

        shop = await user.save();
        return res.status(201).send("OTP sent. Valid for only 2 minutes");
    }
}

module.exports = new ShopController();