const express = require('express');
const router = express.Router();

// contollers and helpers
const { requireSignin, validateAuthToken, isAdmin } = require('../controllers/auth');
const { loadAnimatedBanner, create, addSlides, deleteSlide, saveAnimatedBanners } = require('../controllers/banner');
const { parse } = require('../helpers/formParser');
var { bannerValidator, validate } = require('../helpers/validator');

// create an animated banner
router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, bannerValidator, validate, create )

router.post('/add', requireSignin, validateAuthToken, isAdmin , parse, validate, addSlides )

// save all banners areas on page
router.post('/save', requireSignin, isAdmin, parse, saveAnimatedBanners)

// delete current slide
router.post('/delete', parse, deleteSlide)

// load the animated banner
router.post('/:title', parse, loadAnimatedBanner)

module.exports = router;