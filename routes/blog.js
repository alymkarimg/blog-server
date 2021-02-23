const express = require('express');
const router = express.Router();

// contollers
var { readOne, readAll, create, deleteSelected  } = require('../controllers/blog')
var { requireSignin, validateAuthToken, isAdmin } = require('../controllers/auth')
var { uploadImage } = require('../helpers/ImageUploader')
var { parse, validate } = require('../helpers/formParser')
var { blogValidator, validate } = require('../helpers/validator')


// load one blog article
router.get('/:title/:id', readOne)

// load all blog articles
router.get('/', readAll)

// create a blog article
router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, blogValidator, validate, create )

// delete selected blog articles
router.post('/deleteAdmin', requireSignin, validateAuthToken, isAdmin, parse, deleteSelected)

module.exports = router;