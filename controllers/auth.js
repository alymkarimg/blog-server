const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { emailAccountActivationLink, emailResetPasswordLink } = require('../helpers/authentication')
require('dotenv').config();

// controllers and helpers
const User = require('../models/user')
const { errorHandler } = require('../helpers/dbErrorHandler')
const { createJwt } = require('../helpers/authentication')

// use this to sign up a user without email confirmation
exports.signUp = async (req, res) => {

    try {

        user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({
                errors: [{ message: 'Email is taken' }],
            })
        }

        // signup standard
        var newUser = await User.createUser(req.body);
        await newUser.save();
        const token = createJwt({ _id: newUser._id.toString() }, process.env.JWT_SECRET, '7d');
        res.cookie('t', token, { expire: new Date() + 9999 });
        return res.status(200).json({ newUser, token });

    } catch (e) {

        return res.status(400).json({
            err: errorHandler(e)
        });

    }

}

// use this to create an authentication email
exports.signUpEmail = async (req, res) => {
    try {

        user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({
                errors: [{ message: 'Email is taken' }]
            })
        }

        // create user token
        newUser = await User.createUser(req.body);

        const token = createJwt(newUser.toObject(), process.env.JWT_ACCOUNT_ACTIVATION, '10m');

        const message = await emailAccountActivationLink(newUser.email, token);

        // do i neeed a cookie? 
        // res.cookie('t', token, { expire: new Date() + 9999 });
        res.status(200).json({ newUser, token, message });


    } catch (e) {

        return res.status(400).json({
            err: errorHandler(e)
        });

    }
}

// use this to activate an account using the authentication
exports.accountActivation = async (req, res) => {

    // client url gets the token from the parameter and sends it to the backend
    const { token } = req.body;

    if (token) {

        try {
            await jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION)
            const userObj = jwt.decode(token);
            // activate account
            var user = await User.createUser(userObj);

            try {
                await user.save();
            } catch (e) {
                console.log(e);
                return res.status(401).json({
                    errors: [{ message: 'Error saving user in database. Try signup again' }]
                });
            }

            return res.json({
                user,
                message: 'Signup success. Please signin.'
            });
        } catch (e) {
            console.log(e);
            return res.status(401).json({
                errors: [{ message: 'Expired link. Try signup again' }]
            });
        }
    } else {
        return res.json({
            errors: [{ message: 'Something went wrong, please try again' }]
        });
    }
};

exports.signOut = async (req, res) => {
    res.clearCookie('t')
    res.json({
        message: 'logged out successfully'
    })
}

exports.signIn = async (req, res) => {
    try {

        var user = await User.authenticateUser(req.body, res)
        await user.populate('category').execPopulate();
        const token = createJwt({ _id: user._id.toString() }, process.env.JWT_SECRET, '7d');

        req.profile = user;

        return res.status(200).json({ user, token })

    } catch (e) {
        return res.status(400).json({
            err: errorHandler(e)
        });
    }
}

// adds auth as a user property, user must be have a jwt token to pass this middleware
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth',
    getToken: function fromHeaderOrQuerystring(req, res) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        else {
            return null
        }
    },
})

exports.validateAuthToken = (err, req, res, next) => {

    if (err.name === 'UnauthorizedError') {
        res.status(err.status).send({
            errors: [{ message: err.message }]
        });
        return;
    }
    next();
}


// id in bearer token must match user.id, the user signed in must equal the user created from the route parameters
exports.isAuth = (req, res, next) => {

    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if (!user) {
        return res.status(403).json({
            error: 'Access denied.'
        })
    }
    next();
}

// the user must be in an admin role
exports.isAdmin = async (req, res, next) => {

    var admin = await User.findOne({ _id: req.auth._id });
    await admin.populate('category').execPopulate();

    if (admin.category.title != "admin") {
        return res.status(403).json({
            error: 'Admin resource, access denied.'
        })
    }
    next();
}

exports.forgotPassword = async (req, res) => {

    const { email } = req.body;
    var user;

    try {
        user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                errors: [{ message: 'User with that email does not exist' }]
            });
        }

        const token = createJwt(user.toObject(), process.env.JWT_RESET_PASSWORD, '10m');

        user.resetPasswordLink = token;
        await user.save();

        const message = await emailResetPasswordLink(email, token);

        res.status(200).json({ user, message });
    }
    catch (e) {
        return 'Database connection error on user password forgot request';
    }
};

exports.resetPassword = async (req, res) => {
    // reset password link is taken from the param and put into the bod y via the frontend
    const { resetPasswordLink, password } = req.body;
    var user;

    if (resetPasswordLink) {

        try {
            await jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD)
        }
        catch (e) {
            return res.status(400).json({
                errors: [{ message: 'Expired link. Try again' }]
            });
        }

        try {
            user = await User.findOne({ resetPasswordLink })
        } catch (e) {
            return res.status(400).json({
                errors: [{ message: 'Something went wrong. Try later' }]
            });
        }

        const updatedFields = {
            password: password,
            resetPasswordLink: ''
        };

        user = _.extend(user, updatedFields);

        try {
            await user.save();
            res.json({
                message: `Great! Now you can login with your new password`
            });
        }
        catch (e) {
            return res.status(400).json({
                errors: [{ message: 'Error resetting user password' }]
            });
        }
    }
};

exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;

    var response = await client.verifyIdToken({ idToken, requiredAudience: process.env.GOOGLE_CLIENT_ID })
    const { email_verified, name, email, given_name, family_name, picture } = response.payload;
    if (email_verified) {

        try {
            var user = await User.findOne({ email });
            if (user) {
                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

                const message = 'Successfully logged in!';

                res.status(200).json({ user, token, message });
            }
            else {
                // google login
                var newUser = await User.createUser({
                    firstname: given_name,
                    surname: family_name,
                    email,
                    password: email + process.env.JWT_SECRET,
                    image: picture,
                    category: 'member'
                })

                await newUser.save();
                const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

                const message = 'Successfully signed up!';

                res.status(200).json({ user: newUser, token, message });
            }

        }
        catch (e) {
            return res.status(400).json({
                errors: [{ message: 'Google login failed. Try again' }]
            });
        }
    } else {
        return res.status(400).json({
            errors: [{ message: 'Google login is not verified. Try again' }]
        });
    }
};

exports.facebookLogin = async (req, res) => {
    console.log('FACEBOOK LOGIN REQ BODY', req.body);
    const { userID, accessToken } = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    fetch(url).then(res => res.json()) // expecting a json response
        .then(async response => {
            const { email, name } = response;
            const firstname = name.split(" ")[0]
            const surname = name.split(" ")[1]
            var user = await User.findOne({ email });
            if (user) {
                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                return res.json({
                    token,
                    user
                });

            } else {
                // fb login
                var newUser = await User.createUser({
                    firstname,
                    surname,
                    email,
                    password: email + process.env.JWT_SECRET,
                    category: 'member'
                })

                await newUser.save();

                const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

                const message = 'Successfully signed up!';

                res.status(200).json({ user: newUser, token, message });
            }
        }
        )
};