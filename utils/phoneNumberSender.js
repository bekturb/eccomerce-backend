const sendSms = (message, sender, recep) => {
    const accountSid = process.env.API_KEY;
    const authToken =  process.env.AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: message,
            from: sender,
            to: recep
        })
        .then(message => console.log(message.sid))
}

exports.sendSMS = sendSms;