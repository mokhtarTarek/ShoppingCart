const express = require('express');
const router = express.Router();
const {
	getProducts,
	getOneProduct,
	newProduct,
	updateProduct,
	deleteProduct,
	createProductReview,
	getProductReviews,
	deleteReview,
} = require('../controllers/productController');
const {
	isAuthenticatedUser,
	authorizeRoles,
} = require('../controllers/authController');

//################## PUBLIC ROUTES ######################################

router.route('/products').get(getProducts);
router.route('/product/:id').get(getOneProduct);

//################## PROTECTED & AUTHORIZED ROUTES ######################################
router
	.route('/review')
	.post(isAuthenticatedUser, createProductReview)
	.delete(isAuthenticatedUser, deleteReview);
router.route('/reviews').get(isAuthenticatedUser, getProductReviews);

router
	.route('/admin/product/new')
	.post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router
	.route('/admin/product/:id')
	.patch(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
	.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
