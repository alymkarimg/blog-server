const express = require('express');
const router = express.Router();

const { createMenuItem, loadMenuItems, deleteMenuItem, saveMenuTree } = require('../controllers/menu');
const { requireSignin, isAdmin } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');


router.get('/', parse, loadMenuItems)

// 
router.post('/reorder', requireSignin, isAdmin, parse, saveMenuTree)

router.post('/create', requireSignin, isAdmin, parse, createMenuItem)

router.post('/delete', requireSignin, isAdmin, parse, deleteMenuItem)

router.post('/edit', requireSignin, isAdmin, parse, createMenuItem)


module.exports = router;