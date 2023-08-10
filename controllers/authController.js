const {User} = require("../models/user")
const {validate} = require("../models/auth")
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const {Otp} = require("../models/otp");
const accountSid = process.env.API_KEY;
const authToken =  process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


class AuthController {
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

        let user = await User.findOne({email: email});
        if (!user)
            return res.status(400).send('User wasn\'t found');

        let comparePassword = await bcrypt.compare(password, user.hash_password);
        if (!comparePassword)
            return res.status(400).send('Password wasn\'t found');

        if (!user.verified) {

            let OTP = await Otp.findOne({ userId: user._id });

            if (OTP){
                await Otp.deleteOne({_id: OTP._id});
            }

             OTP = otpGenerator.generate(6, {
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
            return res.status(201).send({message: "OTP sent. Valid for only 2 minutes", user});
        }

        const token = user.generateAuthToken();
        res.header("x-auth-token", token).send({message: "You successfully authorized!", token});
    }
}

module.exports = new AuthController()