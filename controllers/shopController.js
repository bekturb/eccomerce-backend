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
const {Otp} = require("../models/otp");
const {User} = require("../models/user");

class ShopController {

    async getMe(req, res) {
        const shop = await Shop.findById(req.user._id).select("-password");
        res.send(shop);
    }

    async register (req, res) {

        function validateEmail(email) {
            const re =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        function validateNumber(email) {
            const phonePattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;

            if (phonePattern.test(email) && !isNaN(email)) {
                return true;
            }
            return false;
        }

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

        if (validateEmail(req.body.email)) {
            await sendEmail(shop.email, "Verify your email", `Your OTP is ${OTP}.\nDo not share with anyone`);
            await Otp.create({otp: OTP, userId: shop._id});
        } else if (validateNumber(req.body.email)) {
            client.messages
                .create({
                    body: `Your OTP is ${OTP}.\nDo not share with anyone`,
                    from: process.env.TWILLIO_PHONE_NUMBER,
                    to: req.body.email
                }).then(() => {
                Otp.create({otp: OTP, userId: shop._id});
            })
        } else {
            return res.status(400).send("Invalid phone/email.");
        }

        shop = await shop.save();
        return res.status(201).send(shop);
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
            const token = shop.generateAuthToken();
            res.header("x-auth-token", token).send({message: "You successfully authorized!", token});
        } else {
            res.status(400).send("Incorrect OTP or it has been expired.");
        }
    }

    async addFollower(req,res) {
        const { followerId } = req.body;
        const userId = req.user._id;

        const shop = await Shop.findByIdAndUpdate(followerId, { $push: { followers: userId } }, { new: true });

        res.status(200).send(shop);
    }

    async resendOtp(req, res) {

        function validateEmail(email) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        function validateNumber(email) {
            const phonePattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;

            if (phonePattern.test(email) && !isNaN(email)) {
                return true;
            }
            return false;
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let shop = await Shop.findById(req.params.id)
            .select({password: 0});
        if (!shop) return res.status(404).send({message: "No user for the given Id"});

        const OTP = otpGenerator.generate(6, {
            digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });

        if (validateEmail(shop.email)) {
            await sendEmail(shop.email, "Verify your email", `Your OTP is ${OTP}.\nDo not share with anyone`);
            await Otp.create({otp: OTP, userId: shop._id});
        } else if (validateNumber(shop.email)) {
            client.messages
                .create({
                    body: `Your OTP is ${OTP}.\nDo not share with anyone`,
                    from: process.env.TWILLIO_PHONE_NUMBER,
                    to: req.body.email
                }).then(() => {
                Otp.create({otp: OTP, userId: shop._id});
            })
        } else {
            return res.status(400).send("Invalid phone/email.");
        }

        return res.status(201).send("OTP sent. Valid for only 2 minutes");
    }

    async getAll(req, res) {
        const shops = await Shop.find()
            .sort("name")
            .select({password: 0})
        res.send(shops)
    }

    async getSingle(req,res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let shop = await Shop.findById(req.params.id).populate('followers')
            .select({hash_password: 0});
        if (!shop) return res.status(404).send({message: "No shop for the given Id"});

        return res.status(200).send(shop)
    }

    async updateProfile(req, res) {
        const updateProfileSchema = Joi.object({
            name: Joi.string().trim().required(),
            description: Joi.string().trim(),
            avatar: Joi.string(),
            address: Joi.string(),
            phoneNumber: Joi.number(),
            zipCode: Joi.number(),
        });

        const {error} = updateProfileSchema.validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        let shop = await Shop.findByIdAndUpdate(req.user._id, {
            name: req.body.name,
            description: req.body.description,
            avatar: req.body.avatar,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            zipCode: req.body.zipCode,
        });

        if (!shop)
            return res.status(404).send("No shop for the given Id");

        return res.status(200).send({message: "You successfully changed your profile"})
    }

    async changePassword(req,res){

        const passwordSchema = Joi.object({
            oldPassword: joiPassword
                .string()
                .min(8)
                .minOfSpecialCharacters(1)
                .minOfNumeric(1)
                .noWhiteSpaces()
                .onlyLatinCharacters()
                .required(),
            newPassword: joiPassword
                .string()
                .min(8)
                .minOfSpecialCharacters(1)
                .minOfNumeric(1)
                .noWhiteSpaces()
                .onlyLatinCharacters()
                .required(),
            confirmPassword: joiPassword
                .string()
                .min(8)
                .minOfSpecialCharacters(1)
                .minOfNumeric(1)
                .noWhiteSpaces()
                .onlyLatinCharacters()
                .required()
        });

        const {error} = passwordSchema.validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        let shop = await Shop.findById(req.user._id).select("+password");

        let comparePassword = await bcrypt.compare(req.body.oldPassword, shop.password);
        if (!comparePassword)
            return res.status(400).send('Password wasn\'t found');

        if (req.body.newPassword !== req.body.confirmPassword){
            return res.status(400).send('Password does not match');
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const password = await bcrypt.hash(req.body.newPassword, salt);

        shop = await Shop.findByIdAndUpdate(req.user._id, {
            password: password
        }, {new: true});

        if (!shop)
            return res.status(404).send({message: "No user for the given Id"});

        res.status(200).send({message: "You successfully changed your password"})
    }

    async blockUser (req, res) {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).send("Invalid Id");

        const blockShop = await Shop.findByIdAndUpdate(id, {
            isBlocked: true,
        }, {
            new: true,
        });
        res.status(200).send(blockShop)
    }

    async unBlockUser (req, res) {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).send("Invalid Id");

        const blockShop = await Shop.findByIdAndUpdate(id, {
            isBlocked: false,
        }, {
            new: true,
        });
        res.status(200).send(blockShop)
    }

    async resetPassword(req, res) {

        const passwordSchema = Joi.object({
            email: Joi.string().email(),
            newPassword: joiPassword
                .string()
                .min(8)
                .minOfSpecialCharacters(1)
                .minOfNumeric(1)
                .noWhiteSpaces()
                .onlyLatinCharacters()
                .required(),
            confirmPassword: joiPassword
                .string()
                .min(8)
                .minOfSpecialCharacters(1)
                .minOfNumeric(1)
                .noWhiteSpaces()
                .onlyLatinCharacters()
                .required(),
        });

        const {error} = passwordSchema.validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        let shop = await Shop.findOne({email: req.body.email});

        if (!shop) return res.status(400).send({message: "Not found user"});

        if (req.body.newPassword !== req.body.confirmPassword){
            return res.status(400).send('Password does not match');
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        shop.hash_password = await bcrypt.hash(req.body.newPassword, salt);

        shop = await shop.save();

        res.status(200).send("password reset successfully");

    }

    async updatePayment (req, res) {
        const { withdrawMethod } = req.body;

        const seller = await Shop.findByIdAndUpdate(req.seller._id, {
            withdrawMethod,
        });

        res.status(201).send({
            success: true,
            seller,
        });

    }

    async deletePaymentMethod (req, res) {
        const seller = await Shop.findById(req.seller._id);

        if (!seller) {
            return res.status(404).send("Seller not found with this Id");

        }

        seller.withdrawMethod = null;

        await seller.save();

        res.status(201).send({
            success: true,
            seller,
        });
    }
}

module.exports = new ShopController();