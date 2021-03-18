const express = require('express');
const router = express.Router();

const { createMenuItem, loadMenuItems } = require('../controllers/menu');
const { requireSignin, isAdmin } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');

// load all editable areas on the page
router.get('/', parse, loadMenuItems)

// save all editable areas on page
router.post('/save', requireSignin, isAdmin, parse, createMenuItem)


module.exports = router;