require("dotenv").config()

module.exports = function () {
    if (!process.env.JWTPRIVATEKEY) {
        throw new Error('Unexpected error: e-commerce_jwtPrivateKey is undefined.');
    }
}