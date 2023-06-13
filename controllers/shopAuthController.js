const {Shop} = require("../models/shop")
const {validate} = require("../models/auth")
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const {ShopOtp} = require("../models/shopOtp");

class ShopAuthController {

    async create(req, res) {

        const {error} = validate(req.body)
        if (error)
            return res.status(400).send(error.details[0].message)

        const { email, password} = req.body

        let shop = await Shop.findOne({email: email});
        if (!shop)
            return res.status(400).send('Shop wasn\'t found');

        let comparePassword = await bcrypt.compare(password, shop.password);
        if (!comparePassword)
            return res.status(400).send('Password wasn\'t found');

        if (!shop.verified) {

            const OTP = otpGenerator.generate(6, {
                digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
            });
                await sendEmail(shop.email, "Verify your email", `Your OTP is ${OTP}.\nDo not share with anyone`);
                await ShopOtp.create({otp: OTP, shopId: shop._id});
                return res.status(201).send("OTP sent. Valid for only 2 minutes");
        }

        const token = shop.generateAuthToken();
        res.header("x-auth-token", token).send({message: "You successfully authorized!", token});
    }
}

module.exports = new ShopAuthController();