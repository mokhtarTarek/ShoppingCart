const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.newOrder = catchAsync(async (req, res, next) => {
	const {
		orderItems,
		shippingInfo,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
		paymentInfo,
	} = req.body;

	const order = await Order.create({
		orderItems,
		shippingInfo,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
		paymentInfo,
		paidAt: Date.now(),
		user: req.user._id,
	});

	res.status(200).json({
		success: true,
		order,
	});
});

exports.getOneOrder = catchAsync(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate(
		'user',
		'name email'
	);

	if (!order) {
		return next(new AppError('order not found', 404));
	}
	res.status(200).json({
		success: true,
		order,
	});
});

// get logged in user orders
exports.myOrders = catchAsync(async (req, res, next) => {
	const orders = await Order.find({ user: req.user.id });

	res.status(200).json({
		success: true,
		orders,
	});
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
	const orders = await Order.find();

	// calculate
	let totalAmount = 0;
	orders.forEach((order) => {
		totalAmount += order.totalPrice;
	});

	res.status(200).json({
		success: true,
		totalAmount,
		orders,
	});
});

// Update / Process order - ADMIN  =>   /api/v1/admin/order/:id
exports.updateOrder = catchAsync(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) {
		return next(new AppError(`no order found with this ${req.params.id}`, 400));
	}

	if (order.orderStatus === 'Delivered') {
		return next(new AppError('You have already delivered this order', 400));
	}
	// update stock
	order.orderItems.forEach(async (item) => {
		await updateStock(item.product, item.quantity);
	});

	order.orderStatus = req.body.status;
	order.deliveredAt = Date.now();

	await order.save();

	res.status(200).json({
		success: true,
	});
});

exports.deleteOneOrder = catchAsync(async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (!order) {
		return next(new AppError('order not found', 404));
	}
	await order.remove();
	res.status(200).json({
		success: true,
	});
});

//########### HELPER FUNCTION
const updateStock = async (id, qty) => {
	const product = await Product.findById(id);
	product.stock = product.stock - qty;
	await product.save({ validateBeforeSave: false });
};
