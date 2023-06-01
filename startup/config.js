require("dotenv").config()

module.exports = function () {
    if (!process.env.JWTPRIVATEKEY) {
        throw new Error('Unexpected error: adc-project_jwtPrivateKey is undefined.');
    }
}