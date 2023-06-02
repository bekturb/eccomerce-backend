require("dotenv").config();
const mongoose = require("mongoose");
const {User, validate} = require("../models/user");
const {Otp} = require("../models/otp");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const {sendSMS} = require("../utils/phoneNumberSender");
const otpGenerator = require("otp-generator");

class UserController {

    async register(req, res) {

        function validateEmail(email) {
            const re =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        function validateNumber(email) {
            if (email.length >= 6 && !isNaN(email)) {
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
           await sendEmail(user.email, "Verify your email", `Your OTP is ${OTP}.\nDo not share with anyone`)
            let otp = new Otp({otp: OTP, userId: user._id});
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            otp.otp = await bcrypt.hash(`${otp.otp}`, salt);
            otp = await otp.save();
        } else if (validateNumber(req.body.email)) {
           await sendSMS(`Your OTP is ${OTP}.\nDo not share with anyone`, process.env.TWILLIO_PHONE_NUMBER, req.body.email, )
                let otp = new Otp({ otp: OTP, userId: user._id });
                const salt = await bcrypt.genSalt(Number(process.env.SALT));
                otp.otp = await bcrypt.hash(`${otp.otp}`, salt);
                otp = await otp.save();
        } else {
            return res.status(400).send("Invalid phone/email.");
        }
        user = await user.save();
        return res.status(201).send("OTP sent. Valid for only 2 minutes");
    }

    async verify(req, res) {

    }
}

module.exports = new UserController()