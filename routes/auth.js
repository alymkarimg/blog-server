const express = require("express");
const router = express.Router();
require('dotenv')

// contollers, helpers
var {
  signUpEmail,
  accountActivation,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
} = require("../controllers/auth");
var { parse } = require("../helpers/formParser");
var {
  userSignUpValidator,
  userSignInValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  validate,
} = require("../helpers/validator");
const stripe = require('stripe')(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

router.post("/signup", parse, userSignUpValidator, validate, signUpEmail);
router.post("/account-activation", parse, accountActivation);
router.post("/signin", parse, userSignInValidator, validate, signIn);
router.get("/secret/:amount", async (req, res) => {
    try {
        const amountToPay = parseFloat(req.params.amount) * 100
        const intent = await stripe.paymentIntents.create({
            amount: amountToPay,
            currency: "gbp",
            automatic_payment_methods: {
              enabled: true,
            },
          }); // ... Fetch or create the PaymentIntent
          res.json({ client_secret: intent.client_secret });
    } catch (e) {
        debugger
    }
});

router.post("/signout", signOut);
router.put(
  "/forgot-password",
  parse,
  forgotPasswordValidator,
  validate,
  forgotPassword
);
router.put(
  "/reset-password",
  parse,
  resetPasswordValidator,
  validate,
  resetPassword
);

router.post("/google-login", parse, googleLogin);
router.post("/facebook-login", parse, facebookLogin);

module.exports = router;
