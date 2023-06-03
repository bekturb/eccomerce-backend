require("dotenv").config();
const mongoose = require("mongoose");
const {User, validate} = require("../models/user");
const {Otp, validateVerify} = require("../models/otp");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const accountSid = process.env.API_KEY;
const authToken =  process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

class UserController {

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
            return res.status(400).send(error.details[0].message)

        const { otp, email } = req.body;

        let OTP = await Otp.findOne({otp: otp});
        if (!OTP)
            return res.status(400).send('Invalid Otp number');

        const isExist = await User.exists({ _id: OTP.userId });
        if (!isExist) {
            return res.send("Incorrect OTP or it has been expired.");
        }

       const user =  User.findById(OTP.userId);
        if (user) {
            await User.findByIdAndUpdate(OTP.userId, { verified: true });
            await Otp.deleteOne({ _id: OTP._id });
            res.send(`${user.email} has been successfully verified`);
        } else {
            res.send("Incorrect OTP or it has been expired.");
        }
    }
}

module.exports = new UserController()