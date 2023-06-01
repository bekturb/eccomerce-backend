require("dotenv").config();
const mongoose = require("mongoose");
const winston = require("winston");
const {User, validate} = require("../models/user");
const crypto = require("crypto");
const bcrypt  = require("bcrypt");

class UserController {

    async register(req,res) {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message)

        let user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(400).send('This email is already exists');
    }

    async verify(req,res) {

    }
}

module.exports = new UserController()