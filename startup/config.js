require("dotenv").config()

module.exports = function () {
    if (!process.env.HOSTJWTPRIVATEKEY) {
        throw new Error('Unexpected error: e-commerce_jwtPrivateKey is undefined.');
    }
}