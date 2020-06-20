const express = require('express');
const router = express.Router();

// contollers
var { readOne, readAll, create  } = require('../controllers/blog')

// load one blog article
router.get('/', readOne)

// load all blog articles
router.post('/', parse, readAll)

// create a blog article
router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, blogValidator, validate, create )


module.exports = router;