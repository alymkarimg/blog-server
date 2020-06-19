const express = require('express');
const router = express.Router();

const { userById, read, update } = require('../controllers/user');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');
var { userUpdateValidator, validate } = require('../helpers/validator');

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    })
})

// get user profile
router.get('/:userId', requireSignin, isAuth, read)

// update user profile
router.put('/:userId', requireSignin, isAuth, parse, userUpdateValidator, validate, update)

// admin update user profile
router.put('/admin/:userId', requireSignin, isAdmin, parse, userUpdateValidator, validate, update)

router.param('userId', userById)

module.exports = router;