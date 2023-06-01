require("dotenv").config()
const express = require('express');
const app = express();
const winston = require('winston');
require("./startup/logging")();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require("./startup/prod")(app);

const port = process.env.PORT || 5000;
const localAddress = process.env.LOCAL_ADDRESS
const server = app.listen(port, localAddress, () => {
    winston.info(`Server started on port ${port}`);
});

module.exports = server;