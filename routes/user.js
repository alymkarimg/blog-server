const express = require('express');
const router = express.Router();

const { userById, read, update, readAll, create, deleteSelected, editOne } = require('../controllers/user');
const { requireSignin, isAuth, isAdmin, validateAuthToken } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');
var { userUpdateValidator, validate, userSignUpValidator } = require('../helpers/validator');

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


// load all blog articles
router.get('/', readAll)

// create a blog article
router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, userSignUpValidator, validate, create )

// delete selected blog articles
router.post('/delete', requireSignin, validateAuthToken, isAdmin, parse, deleteSelected)

router.post('/edit', requireSignin, validateAuthToken, isAdmin, parse, userSignUpValidator, validate, editOne)


module.exports = router;