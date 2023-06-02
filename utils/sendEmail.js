require("dotenv").config()
const sendEmail  = require("nodemailer");
const winston = require("winston");

module.exports = async (email, subject, text) => {
    try {
        let transporter = sendEmail.createTransport({
            host: process.env.HOST,
            service:process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure:Boolean(process.env.SECURE),
            auth: {
                user:process.env.AUTH_USER,
                pass:process.env.AUTH_PASS
            }
        });

        await transporter.sendMail({
            from: String(process.env.AUTH_USER),
            to: email,
            subject: subject,
            text: text
        });
        winston.info("Email sent Successfully");
    }catch (error){
        winston.info("Email not sent");
        winston.info(error)
    }
}