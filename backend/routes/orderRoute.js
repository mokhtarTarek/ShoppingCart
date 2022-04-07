const express = require('express');
const router = express.Router();
const {
	newOrder,
	myOrders,
	getOneOrder,
	getAllOrders,
	updateOrder,
	deleteOneOrder,
} = require('../controllers/orderController');
const {
	isAuthenticatedUser,
	authorizeRoles,
} = require('../controllers/authController');

//################## PROTECTED ROUTES ######################################

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/me').get(isAuthenticatedUser, myOrders);
router.route('/order/:id').get(isAuthenticatedUser, getOneOrder);

//################## AUTHORIZED ROUTES ######################################

router
	.route('/admin/orders')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router
	.route('/admin/order/:id')
	.patch(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
	.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOneOrder);

module.exports = router;
