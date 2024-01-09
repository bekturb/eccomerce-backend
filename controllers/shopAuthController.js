const {Shop} = require("../models/shop")
const {validate} = require("../models/auth")
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const {ShopOtp} = require("../models/shopOtp");
const accountSid = process.env.API_KEY;
const authToken =  process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

class ShopAuthController {

    async create(req, res) {

        function validateEmail(email) {
            const re =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        function validateNumber(email) {
            const phonePattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;

            if (phonePattern.test(email)  && !isNaN(email)) {
                return true;
            }
            return false;
        }

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
            let OTP = await ShopOtp.findOne({ shopId: shop._id });

            if (OTP){
                await ShopOtp.deleteOne({_id: OTP._id});
            }

            OTP = otpGenerator.generate(6, {
                digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
            });

            if (validateEmail(req.body.email)) {
                await sendEmail(shop.email, "Verify your email", `Your OTP is ${OTP}.\nDo not share with anyone`);
                await ShopOtp.create({otp: OTP, shopId: shop._id});
            } else if (validateNumber(req.body.email)) {
                client.messages
                    .create({
                        body: `Your OTP is ${OTP}.\nDo not share with anyone`,
                        from:  process.env.TWILLIO_PHONE_NUMBER,
                        to: req.body.email
                    }).then(() => {
                    ShopOtp.create({otp: OTP, shopId: shop._id});
                })
            } else {
                return res.status(400).send("Invalid phone/email.");
            }
            return res.status(201).send({message: "OTP sent. Valid for only 2 minutes", shop});
        }

        const token = shop.generateAuthToken();
        res.header("x-auth-token", token).send({message: "You successfully authorized!", token});
    }
}

module.exports = new ShopAuthController();