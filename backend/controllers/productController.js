const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/ApiFeatures');

// get all products => /api/v1/products
exports.getProducts = catchAsync(async (req, res, next) => {
	//return next(new AppError('product not found', 404));
	const resPerPage = 4;
	const productsCount = await Product.countDocuments();

	const apiFeatures = new ApiFeatures(Product.find(), req.query)

		.search()
		.filter();
	let products2 = await apiFeatures.query; //
	let filteredProductsCount = products2.length;
	const features = new ApiFeatures(Product.find(), req.query)
		.search()
		.filter()
		.paginate(resPerPage);

	let products = await features.query; //
	//apiFeatures.paginate(resPerPage);
	//products = await apiFeatures.query;

	res.status(200).json({
		success: true,
		productsCount,
		resPerPage,
		filteredProductsCount,
		products,
	});
});

// get single product by Id => /api/v1/product/:id
exports.getOneProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	if (!product) {
		return next(new AppError('product not found', 404));
	}
	res.status(200).json({
		success: true,
		product,
	});
});

// create new product => /api/v1/product/new
exports.newProduct = catchAsync(async (req, res, next) => {
	req.body.user = req.user.id;
	const product = await Product.create(req.body);

	res.status(201).json({
		success: true,
		product,
	});
});

// Update product by Id => /api/v1/product/:id
exports.updateProduct = catchAsync(async (req, res, next) => {
	let product = await Product.findById(req.params.id);
	if (!product) {
		return next(new AppError('product not found', 404));
	}

	await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidator: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
		product,
	});
});

// delete product by id => /api/v1/product/:id
exports.deleteProduct = catchAsync(async (req, res, next) => {
	let product = await Product.findById(req.params.id);
	if (!product) {
		return next(new AppError('product not found', 404));
	}

	await product.remove();
	res.status(204).json({
		success: true,
		message: 'product deleted',
	});
});

//#############################reviews

// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsync(async (req, res, next) => {
	const { rating, comment, productId } = req.body;

	const review = {
		user: req.user._id,
		name: req.user.name,
		rating: Number(rating),
		comment,
	};

	const product = await Product.findById(productId);

	// check if the product is alerady reviewed by the same user
	const isReviewed = product.reviews.find(
		(r) => r.user.toString() === req.user._id.toString()
	);

	if (isReviewed) {
		// update the exsisting review
		product.reviews.forEach((review) => {
			if (review.user.toString() === req.user._id.toString()) {
				review.comment = comment;
				review.rating = rating;
			}
		});
	} else {
		// push a new review
		product.reviews.push(review);
		product.numOfReviews = product.reviews.length;
	}

	product.ratings =
		product.reviews.reduce((acc, item) => item.rating + acc, 0) /
		product.reviews.length;

	await product.save({ validateBeforeSave: false });

	res.status(200).json({
		success: true,
	});
});

// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.query.id);

	res.status(200).json({
		success: true,
		reviews: product.reviews,
	});
});

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.query.productId);

	//console.log(product);

	// filtering out reviews : return all the reviews except one that we want to delete
	const reviews = product.reviews.filter(
		(review) => review._id.toString() !== req.query.id.toString()
	);

	const numOfReviews = reviews.length;

	const ratings =
		reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

	await Product.findByIdAndUpdate(
		req.query.productId,
		{
			reviews,
			ratings,
			numOfReviews,
		},
		{
			new: true,
			runValidators: true,
			useFindAndModify: false,
		}
	);

	res.status(200).json({
		success: true,
	});
});
