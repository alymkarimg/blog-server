const express = require('express');
const router = express.Router();

const { saveEditableArea, loadEditableArea, loadAllEditableAreas, createPage } = require('../controllers/editableArea');
const { uploadImage } = require('../helpers/imageUploader');
const { requireSignin, isAdmin } = require('../controllers/auth');
const { parse } = require('../helpers/formParser');

// router.post('/', parse, loadEditableArea)

// load the animated banner
router.post('/loadAllEditableAreas', parse, loadAllEditableAreas)

// save all editable areas on page
router.post('/save', requireSignin, isAdmin, parse, saveEditableArea)

router.post('/create-page', requireSignin, isAdmin, parse, createPage)

// upload an image from an editable area and return the URL + toast
router.post('/upload-image', requireSignin, isAdmin, parse, uploadImage)

module.exports = router;