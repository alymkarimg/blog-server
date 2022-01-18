const express = require('express');
const router = express.Router();

var { readOne, readAll, create, deleteSelected, editOne  } = require('../controllers/category')
const { requireSignin, validateAuthToken, isAdmin } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');
var { categoryCreateValidator, validate } = require('../helpers/validator');

// load all categories 
router.get('/', readAll)

// load one category
router.get('/:slug', readOne)

// create a category
router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, categoryCreateValidator, validate, create )

// delete selected categories
router.post('/delete', requireSignin, validateAuthToken, isAdmin, parse, deleteSelected)

// edit category
router.post('/edit', requireSignin, validateAuthToken, isAdmin, parse, editOne)

module.exports = router;