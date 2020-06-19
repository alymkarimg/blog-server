const jwt = require('jsonwebtoken');
const sendgridmail = require('@sendgrid/mail');
sendgridmail.setApiKey(process.env.SENDGRID_API_KEY);
require("dotenv").config();

// create jwt with secret key
exports.createJwt = function(payload, secret, expiresIn) {
    const token = jwt.sign(payload, secret, { expiresIn })
    return token;
}

// use this to create a user and email, do not save to database
exports.emailAccountActivationLink = async function (email, token) {

    // emailFrom, emailTo, token
    const msg = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Account activation email`,
        html: `<h1>Please use the following link to activate your account</h1>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr>
        <p> This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}</p>`
    }

    try {
        await sendgridmail.send(msg);
        return `An email has been sent to ${email}. Follow the instructions to activate your account`;
    } catch (error) {
        return 'There was a problem sending your activation email, please try again.';
    }
}

exports.emailResetPasswordLink = async function (email, token) {

    const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Password Reset link`,
        html: `
            <h1>Please use the following link to reset your password</h1>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `
    };

    try {
        await sendgridmail.send(emailData);
        return `An email has been sent to ${email}. Follow the instructions to activate your account`;
    } catch (error) {
        return 'There was a problem sending your activation email, please try again.';
    }
}