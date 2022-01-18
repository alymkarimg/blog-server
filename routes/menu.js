const express = require('express');
const router = express.Router();

const { createMenuItem, loadMenuItems, deleteMenuItem, saveMenuTree, editOne } = require('../controllers/menu');
const { requireSignin, validateAuthToken,  isAdmin } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');


router.get('/', parse, loadMenuItems)

// 
router.post('/reorder', validateAuthToken, requireSignin, isAdmin, parse, saveMenuTree)

router.post('/create', validateAuthToken, requireSignin, isAdmin, parse, createMenuItem)

router.post('/delete', requireSignin, validateAuthToken, isAdmin, parse, deleteMenuItem)

router.post('/edit', requireSignin, validateAuthToken, isAdmin, parse, editOne)


module.exports = router;