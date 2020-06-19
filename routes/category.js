const express = require('express');
const router = express.Router();

const { create } = require('../controllers/category');
const { requireSignin, validateAuthToken, isAdmin } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');
var { categoryCreateValidator, validate } = require('../helpers/validator');

router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, categoryCreateValidator, validate, create)

module.exports = router;