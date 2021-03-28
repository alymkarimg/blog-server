const express = require('express');
const router = express.Router();

const { createMenuItem, loadMenuItems } = require('../controllers/menu');
const { requireSignin, isAdmin } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');


router.get('/', parse, loadMenuItems)

// 
router.post('/create', requireSignin, isAdmin, parse, createMenuItem)


module.exports = router;