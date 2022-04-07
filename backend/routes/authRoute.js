const express = require('express');
const router = express.Router();
const {
	registerUser,
	loginUser,
	logout,
	forgotPassword,
	resetPassword,
	getUserProfil,
	updateUserProfil,
	updatePassword,
	getAllUser,
	getUserDetails,
	updateUser,
	deleteUser,
} = require('../controllers/authController');
const {
	isAuthenticatedUser,
	authorizeRoles,
} = require('../controllers/authController');

//################## PUBLIC ROUTES ######################################

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').patch(resetPassword);

//################## PROTECTED ROUTES ######################################

router.route('/me').get(isAuthenticatedUser, getUserProfil);
router.route('/me/update').patch(isAuthenticatedUser, updateUserProfil);
router.route('/password/update').patch(isAuthenticatedUser, updatePassword);

//################## AUTHORIZED ROUTES ######################################

router.route('/admin/users').get(getAllUser);
router
	.route('/admin/user/:id')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails)
	.patch(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
	.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;
