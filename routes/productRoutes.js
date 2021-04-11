const express = require('express');
const router = express.Router();

const { getProducts,getProductById, deleteProduct, createProduct, updateProduct, createProductReview, getTopProducts } = require('../controllers/productController.js');
const { requireSignin, isAdmin, validateAuthToken } = require('../controllers/auth');

router.route('/').get(getProducts).post(requireSignin, validateAuthToken, isAdmin, createProduct)
router.route('/:id/reviews').post(requireSignin, validateAuthToken, createProductReview)
router.get('/top', getTopProducts)
router
    .route('/:id')
    .get(getProductById)
    .delete(requireSignin, validateAuthToken, isAdmin, deleteProduct)
    .put(requireSignin, validateAuthToken, isAdmin, updateProduct)

module.exports = router;