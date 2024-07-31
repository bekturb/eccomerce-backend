const {User} = require("../models/user");
const Joi = require("joi");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("otp-generator");
const {Otp} = require("../models/otp");
const accountSid = process.env.API_KEY;
const authToken =  process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

class PasswordResetController {

    certainUser = ""
    async postEmail(req, res) {

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

        const emailSchema = Joi.object({
            email: Joi.string().email().required().label("Email")
        });

        const {error} = emailSchema.validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message})

        let user = await User.findOne({email: req.body.email});
        if (!user)
            return res.status(400).send({message: "User with given email does not exist"});

        this.certainUser = user._id

        const OTP = otpGenerator.generate(6, {
            digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });

        if (validateEmail(req.body.email)) {
            await sendEmail(user.email, "Reset password", `Your OTP is ${OTP}.\nDo not share with anyone`);
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
            return res.status(400).send({message: "Invalid phone/email."});
        }
        user = await user.save();
        return res.status(201).send("OTP sent. Valid for only 2 minutes");
    }

    async verify(req, res) {

        const {error} = validateVerify(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        let OTP = await Otp.findOne({ userId: req.params.id });
        if (!OTP)
            return res.status(400).send('Invalid OTP number');

        const isMatch = await bcrypt.compare(req.body.otp, OTP.otp);

        if (!isMatch) {
            return res.status(400).send("Incorrect OTP or it has been expired.");
        }

        const user = await User.findById(OTP.userId);
        if (user) {
            await Otp.deleteOne({_id: OTP._id});
            await res.status(200).send("Email verified successfully!");
        } else {
            res.status(400).send("Incorrect OTP or it has been expired.");
        }
    }
}

module.exports = new PasswordResetController();