const express = require("express");
const cors = require("cors");
const errorMiddleware = require("../middlewares/error");
const bodyParser = require("body-parser");
const productsRoute = require("../routes/products");
const usersRoute = require("../routes/users");
const authRoute = require("../routes/auth");
const categoryRoute = require("../routes/categories");
const cartRoute = require("../routes/carts");
const passwordResetRoute = require("../routes/resetPassword");

const imagesRoute = require("../routes/images");

module.exports = function (app) {
    app.use(cors());
    app.use(express.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use("/uploads", express.static("uploads"));
    app.use('/api/products', productsRoute);
    app.use('/api/users', usersRoute);
    app.use('/api/users/cart', cartRoute);
    app.use('/api/login', authRoute);
    app.use('/api/categories', categoryRoute);
    app.use('/api/password-reset', passwordResetRoute);

    app.use('/api/upload', imagesRoute);
    app.use(errorMiddleware);
}