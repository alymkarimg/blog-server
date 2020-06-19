const express = require('express');
const router = express.Router();

// contollers
var { readOne } = require('../controllers/blog')

router.get('/', readOne)

module.exports = router;