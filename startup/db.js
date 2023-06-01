require("dotenv").config();
const mongoose = require('mongoose');
const winston = require("winston");

module.exports = function () {
    mongoose.set("strictQuery", true);
    mongoose.connect(`mongodb+srv://${process.env.MONGODB_DB_USER}:${process.env.MONGODB_DB_PASSWORD}@cluster0.pq2qluf.mongodb.net/${process.env.MONGODB_DB_DATABASE}?retryWrites=true&w=majority`,
        {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            winston.debug('Successfully connected to mongodb');
        });
}