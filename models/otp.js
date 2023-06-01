const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    otp: {
        type: Number
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const Otp = mongoose.mongo("otp", otpSchema);

module.exports = Otp;