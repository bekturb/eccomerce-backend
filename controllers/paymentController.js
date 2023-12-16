const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class PaymentController {

     async postPayment (req, res) {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "inr",
            metadata: {
                company: "BekaStore",
            },
        });
        res.status(200).send({
            success: true,
            client_secret: myPayment.client_secret
        })
    }

    async getPaymentData (req, res) {
         res.status(200).send({
             stripeApiKey: process.env.STRIPE_API_KEY
         })
    }
}

module.exports = new PaymentController()