const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//register user => api/v1/register
exports.registerUser = catchAsync(async (req, res, next) => {
	const { name, email, password } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		avatar: {
			public_id: 'v1641665437/cld-sample.jpg',
			url: 'https://res.cloudinary.com/dsvnorobs/image/upload/v1641665437/cld-sample.jpg',
		},
	});

	sendToken(user, 200, res);
});

// Login User  =>  /api/v1/login
exports.loginUser = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// Checks if email and password is entered by user
	if (!email || !password) {
		return next(new AppError('Please enter email & password', 400));
	}

	// Finding user in database
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new AppError('Invalid Email or Password', 401));
	}

	// Checks if password is correct or not using bcrypt compare
	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new AppError('Invalid Email or Password', 401));
	}

	sendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
	const options = {
		expires: new Date(Date.now()),
		httpOnly: true,
	};
	res.cookie('token', null, options);
	res.status(200).json({
		success: true,
		message: 'Logged Out',
	});
});
// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsync(async (req, res, next) => {
	//console.log(req.cookies);
	const { token } = req.cookies;

	if (!token) {
		return next(new AppError('Login first to access this resource.', 401));
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	// decoded :{id:'xxx',iat:'xxxx',exp:'yyyy'}
	// add the user to the request : will be used later
	req.user = await User.findById(decoded.id);
	next();
});

// Handling users roles
exports.authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(
					`Role (${req.user.role}) is not allowed to acccess this resource`,
					403
				)
			);
		}
		next();
	};
};

// Forgot Password   =>  /api/v1/password/forgot
exports.forgotPassword = catchAsync(async (req, res, next) => {
	// check if user exist
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('User not found with this email', 404));
	}
	// Get reset token : userModel method
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// Create reset password url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/password/reset/${resetToken}`;

	const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'ShopIT Password Recovery',
			message,
		});

		res.status(200).json({
			success: true,
			message: `Email sent to: ${user.email}`,
		});
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new AppError(error.message, 500));
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1- Get user based on the reset token
	const hachedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken: hachedToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new AppError('token is not valid or expired', 400));
	}

	// 2- check for password confirm
	if (req.body.password !== req.body.passwordConfirm) {
		return next(
			new AppError('password and passwordConfirm does not match'),
			400
		);
	}

	// 3- save new password and send new token
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();
	sendToken(user, 200, res);
});

exports.getUserProfil = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		user,
	});
});

exports.updateUserProfil = catchAsync(async (req, res, next) => {
	const newUserdata = {
		name: req.body.name,
		email: req.body.email,
	};

	// update user avatar : TODO

	const user = await User.findByIdAndUpdate(req.user.id, newUserdata, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
		user,
	});
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	// get the user
	const user = await User.findById(req.user.id).select('+password');
	// check oldPassword
	const isMatched = await user.comparePassword(req.body.oldPassword);
	if (!isMatched) {
		return next(new AppError('passwords is not valid! try again'), 400);
	}

	user.password = req.body.password;
	await user.save();

	sendToken(user, 200, res);
});

exports.getAllUser = catchAsync(async (req, res, next) => {
	const users = await User.find();
	res.status(200).json({
		success: true,
		users,
	});
});

exports.getUserDetails = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new AppError(`no user found with this ${req.params.id}`));
	}
	res.status(200).json({
		success: true,
		user,
	});
});

exports.updateUser = catchAsync(async (req, res, next) => {
	const newUserdata = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
	};

	const user = await User.findByIdAndUpdate(req.user.id, newUserdata, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
		user,
	});
});

exports.deleteUser = catchAsync(async (req, res, next) => {
	let user = await User.findById(req.params.id);
	if (!user) {
		return next(new AppError(`no user found with this ${req.params.id}`));
	}

	// remove avatar fromcloudinary

	await user.remove();
	res.status(204).json({
		seccess: true,
		message: 'user deleted',
	});
});
