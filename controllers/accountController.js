require("dotenv").config();
const {Account, validate} = require("../models/account");
const sendEmail = require("../utils/sendEmail");

class AccountController {

    async register(req, res) {

        const {error} = validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message)

        let account = await Account.findOne({email: req.body.email});
        if (account)
            return res.status(400).send('This email is already exists');

        account = new Account({
            email: req.body.email,
        });

        await sendEmail(account.email, `Dear ${account.email}`, `You successfully registered your e mail account! We will send our news to your account.`);

        account = await account.save();
        return res.status(201).send(account);
    }
}

module.exports = new AccountController()