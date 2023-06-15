const sendEmail = require("../utils/sendEmail");
const {Withdraw, validate} = require("../models/withdraw");
const {Shop} = require("../models/shop");
const mongoose = require("mongoose");
const Joi = require("joi");

class WithdrawController {
    async create(req, res) {
        try {
            const {error} = validate(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }

            const shop = await Shop.findById(req.user._id);
            if (!shop) {
                return res.status(400).send('Seller not Found');
            }

            const {amount} = req.body;

            const sanitizedAmount = parseFloat(amount);
            if (isNaN(sanitizedAmount) || sanitizedAmount <= 0) {
                return res.status(400).send('Invalid amount');
            }

            if (shop.availableBalance < sanitizedAmount) {
                return res.status(400).send('Insufficient balance');
            }

            const updatedBalance = shop.availableBalance - sanitizedAmount;
            shop.availableBalance = updatedBalance;
            await shop.save();

            const withdrawalEmailContent = `Hello ${shop.name}, Your withdrawal request of ${sanitizedAmount}$ is processing. It will take 3 to 7 days to process.`;
            await sendEmail(shop.email, 'Withdraw Request', withdrawalEmailContent);

            const withdraw = new Withdraw({
                seller: shop,
                amount: sanitizedAmount,
            });
            await withdraw.save();

            res.status(201).send({
                success: true,
                withdraw,
            });
        } catch (error) {
            res.status(500).send('Withdrawal failed');
        }
    }

    async getAll(req, res) {
        const withdrawals = await Withdraw.find().sort({createdAt: -1});
        res.status(200).send(withdrawals)
    }
    async update(req, res) {

        function validate(withdraw) {
            const schema = Joi.object({
                sellerId: Joi.string().required()
            });
            return schema.validate(withdraw);
        }

        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(404).send('Invalid Id');
            }

            const { error } = validate(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }

            const { sellerId } = req.body;

            const withdraw = await Withdraw.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'succeed',
                    updatedAt: Date.now(),
                },
                { new: true }
            );

            const seller = await Shop.findById(sellerId);
            if (!seller) {
                return res.status(400).send('Seller not found');
            }

            const transaction = {
                _id: withdraw._id,
                amount: withdraw.amount,
                updatedAt: withdraw.updatedAt,
                status: withdraw.status,
            };

            seller.transactions = [...seller.transactions, transaction];
            await seller.save();

            const paymentEmailContent = `Hello ${seller.name}, Your withdrawal request of ${withdraw.amount}$ is on the way. Delivery time depends on your bank's rules, usually taking 3 to 7 days.`;
            await sendEmail(seller.email, 'Payment Confirmation', paymentEmailContent);

            res.status(201).send({
                success: true,
                withdraw,
            });
        } catch (error) {
            res.status(500).send('Withdrawal update failed');
        }
    }
}

module.exports = new WithdrawController();