const express = require('express');
const router = express.Router();

// contollers and helpers
const { requireSignin, validateAuthToken, isAdmin } = require('../controllers/auth');
const { loadAnimatedBanner, create } = require('../controllers/banner');
const { parse } = require('../helpers/formParser');
var { bannerValidator, validate } = require('../helpers/validator');

// load all banners
router.post('/', parse, loadAnimatedBanner)

// create an animated banner
router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, bannerValidator, validate, create )

module.exports = router;