const sendEmail = require("../utils/sendEmail");
const {Withdraw, validate} = require("../models/withdraw");
const {Shop} = require("../models/shop");
class WithdrawController {
    async create (req, res) {
        const {error} = validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        let shop = await Shop.findById(req.user._id);
        if (!shop)
            return res.status(400).send('Seller not Found');

        const { amount } = req.body;

        const data = {
            seller: shop,
            amount,
        };

        await sendEmail(shop.email, "Withdraw Request",`Hello ${shop.name}, Your withdraw request of ${amount}$ is processing. It will take 3days to 7days to processing! `);
        res.status(201).json({
            success: true,
        });
    }
}

module.exports = new WithdrawController();