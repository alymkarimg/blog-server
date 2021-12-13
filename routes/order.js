const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, updateOrderToPaid, updateOrderToDelivered, getMyOrders, getOrders } = require('../controllers/order');
const { requireSignin, isAdmin, validateAuthToken } = require('../controllers/auth');
// router.post('/create', requireSignin, validateAuthToken, isAdmin, parse, blogValidator, validate, create )

router.route('/').post(requireSignin, validateAuthToken, addOrderItems).get(requireSignin, validateAuthToken, isAdmin, getOrders)
router.route('/myorders').get(requireSignin, validateAuthToken, getMyOrders)
router.route('/:id').get(requireSignin, validateAuthToken, getOrderById)
router.route('/:id/pay').put(requireSignin, validateAuthToken, updateOrderToPaid)
router.route('/:id/deliver').put(requireSignin, validateAuthToken, isAdmin, updateOrderToDelivered)

module.exports = router;