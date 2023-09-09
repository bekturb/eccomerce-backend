require("dotenv").config();
const express = require('express');
const cron = require('node-cron');
const app = express();
const winston = require('winston');
const Events = require("twilio/lib/rest/Events");
require("./startup/logging")();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require("./startup/prod")(app);

cron.schedule('0 * * * *', async () => {
    try {
        const currentDate = new Date();
        await Events.deleteMany({ endDate: { $lte: currentDate } });
        console.log('Expired offers removed.');
    } catch (error) {
        console.error('Error removing expired offers:', error);
    }
});

const port = process.env.PORT || 5000;
const localAddress = process.env.LOCAL_ADDRESS
const server = app.listen(port, localAddress, () => {
    winston.info(`Server started on port ${port}`);
});

module.exports = server;