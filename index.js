require("dotenv").config();
const {app, servers} = require("./socket/socket") 
const winston = require('winston');
require("./startup/logging")();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require("./startup/prod")(app);
require("./startup/salesResetTask");

const port = process.env.PORT || 5000;
const localAddress = process.env.LOCAL_ADDRESS
const server = servers.listen(port, localAddress, () => {
    winston.info(`Server started on port ${port}`);
});

module.exports = server;