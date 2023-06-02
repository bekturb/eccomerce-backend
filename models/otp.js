const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    otp: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: { type: Date, default: Date.now, index: {expires: 300}}
}, {timestamps: true});

const Otp = mongoose.model("otp", otpSchema);

exports.Otp = Otp;