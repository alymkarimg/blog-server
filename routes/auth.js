const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);


// contollers, helpers
var { signUpEmail, accountActivation, signIn, signOut, forgotPassword, resetPassword, googleLogin, facebookLogin } = require('../controllers/auth')
var { parse } = require('../helpers/formParser')
var { userSignUpValidator, userSignInValidator, forgotPasswordValidator, resetPasswordValidator, validate } = require('../helpers/validator')

router.post('/signup', parse, userSignUpValidator, validate, signUpEmail)
router.post('/account-activation', parse, accountActivation);
router.post('/signin', parse, userSignInValidator, validate, signIn)

router.post('/signout', signOut)
router.put('/forgot-password', parse, forgotPasswordValidator, validate, forgotPassword);
router.put('/reset-password', parse, resetPasswordValidator, validate, resetPassword);

router.post('/google-login', parse, googleLogin);
router.post('/facebook-login', parse, facebookLogin);

module.exports = router;