require("dotenv").config();
const mongoose = require("mongoose");
const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);
const {User, validate} = require("../models/user");
const {Otp, validateVerify} = require("../models/otp");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const accountSid = process.env.API_KEY;
const authToken =  process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

class UserController {

    async getMe(req, res) {
        const user = await User.findById(req.user._id).select("-password");
        res.send(user);
    }

    async register(req, res) {

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

        const {error} = validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message)

        let user = await User.findOne({email: req.body.email});
        if (user)
            return res.status(400).send('This email is already exists');

        user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            hash_password: req.body.hash_password,
            profilePicture: req.body.profilePicture
        });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        user.hash_password = await bcrypt.hash(user.hash_password, salt);

        const OTP = otpGenerator.generate(6, {
            digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });

        if (validateEmail(req.body.email)) {
           await sendEmail(user.email, "Verify your email", `Your OTP is ${OTP}.\nDo not share with anyone`);
            await Otp.create({otp: OTP, userId: user._id});
        } else if (validateNumber(req.body.email)) {
            client.messages
                .create({
                    body: `Your OTP is ${OTP}.\nDo not share with anyone`,
                    from:  process.env.TWILLIO_PHONE_NUMBER,
                    to: req.body.email
                }).then(() => {
                Otp.create({otp: OTP, userId: user._id});
                })
        } else {
            return res.status(400).send("Invalid phone/email.");
        }
        user = await user.save();
        return res.status(201).send("OTP sent. Valid for only 2 minutes");
    }

    async verify(req, res) {

        const {error} = validateVerify(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        let OTP = await Otp.findOne();
        if (!OTP)
            return res.status(400).send('Invalid OTP number');

        const isMatch = await bcrypt.compare(req.body.otp, OTP.otp);

        if (!isMatch) {
            return res.send("Incorrect OTP or it has been expired.");
        }

        const user = await User.findById(OTP.userId);
        if (user) {
            await User.findByIdAndUpdate(OTP.userId, { verified: true });
            await Otp.deleteOne({ _id: OTP._id });
            res.status(200).send(`${user.email} has been successfully verified`);
        } else {
            res.status(400).send("Incorrect OTP or it has been expired.");
        }
    }

    async getAll(req, res) {
        const users = await User.find()
            .sort("firstName")
            .select({password: 0})
        res.send(users)
    }

    async getSingle(req,res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(404).send("Invalid Id");

        let user = await User.findById(req.params.id)
            .select({hash_password: 0});
        if (!user) return res.status(404).send({message: "No user for the given Id"});

        return res.status(200).send(user)
    }

    async updateProfile(req, res) {
        const updateProfileSchema = Joi.object({
            firstName: Joi.string().trim().min(3).max(20).required(),
            lastName: Joi.string().trim().min(3).max(20).required(),
            profilePicture: Joi.string(),
        });

        const {error} = updateProfileSchema.validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        let user = await User.findByIdAndUpdate(req.user._id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            profilePicture: req.body.profilePicture,
        });

        if (!user)
            return res.status(404).send("No user for the given Id");

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

        let user = await User.findById(req.user._id).select("+password");

        let comparePassword = await bcrypt.compare(req.body.oldPassword, user.hash_password);
        if (!comparePassword)
            return res.status(400).send('Password wasn\'t found');

        if (req.body.newPassword !== req.body.confirmPassword){
            return res.status(400).send('Password does not match');
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const password = await bcrypt.hash(req.body.newPassword, salt);

        user = await User.findByIdAndUpdate(req.user._id, {
            hash_password: password
        }, {new: true});

        if (!user)
            return res.status(404).send({message: "No user for the given Id"});

        res.status(200).send({message: "You successfully changed your password"})
    }

    async updateRole(req, res) {
        const updateRoleSchema = Joi.object({
            role: Joi.string().valid("user", "admin")
        });

        const {error} = updateRoleSchema.validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        let user = await User.findByIdAndUpdate(req.params.id, {
            role: req.body.role
        });

        if (!user)
            return res.status(404).send("No user for the given Id");

        return res.status(200).send({message: "User role changed successfully"})
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

        let user = await User.findOne({email: req.body.email});

        if (!user) return res.status(400).send({message: "Not found user"});

        if (req.body.newPassword !== req.body.confirmPassword){
            return res.status(400).send('Password does not match');
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        user.hash_password = await bcrypt.hash(req.body.newPassword, salt);

        user = await user.save();

        res.status(200).send("password reset successfully")

    }
}

module.exports = new UserController()