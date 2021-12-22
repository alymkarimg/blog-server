const express = require('express');
const router = express.Router();

// contollers
var { readOne, readAll, create, deleteSelected, editOne  } = require('../controllers/product')
var { requireSignin, validateAuthToken, isAdmin } = require('../controllers/auth')
var { parse, validate } = require('../helpers/formParser')
var { productValidator, validate } = require('../helpers/validator')


// load all products 
router.get('/', readAll)

// load one product
router.get('/:slug', readOne)

// create a blog article
router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, productValidator, validate, create )

// delete selected blog articles
router.post('/delete', requireSignin, validateAuthToken, isAdmin, parse, deleteSelected)

router.post('/edit', requireSignin, validateAuthToken, isAdmin, parse, editOne)

module.exports = router;