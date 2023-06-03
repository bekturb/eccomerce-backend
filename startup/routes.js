const express = require("express");
const cors = require("cors");
const errorMiddleware = require("../middlewares/error");
const bodyParser = require("body-parser");
const projectsRoute = require("../routes/projects");
const usersRoute = require("../routes/users");
const authRoute = require("../routes/auth");

const imagesRoute = require("../routes/images");

module.exports = function (app) {
    app.use(cors());
    app.use(express.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use("/uploads", express.static("uploads"));
    app.use('/api/projects', projectsRoute);
    app.use('/api/users', usersRoute);
    app.use('/api/login', authRoute);
    app.use('/api/upload', imagesRoute);
    app.use(errorMiddleware);
}