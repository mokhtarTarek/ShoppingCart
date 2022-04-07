const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'please enter product name'],
		trim: true,
		maxLength: [100, 'the name must be less then 100 characters'],
	},
	price: {
		type: Number,
		required: [true, 'please enter product price'],
		maxLength: [5, 'the price must be less then 5 characters'],
		default: 0.0,
	},
	description: {
		type: String,
		required: [true, 'please enter a description for the product'],
	},
	ratings: {
		type: Number,
		default: 2,
	},
	images: [
		{
			public_id: {
				type: String,
				required: true,
			},
			url: {
				type: String,
				required: true,
			},
		},
	],
	category: {
		type: String,
		required: [true, 'please select product category'],
		enum: {
			values: [
				'Electronics',
				'Cameras',
				'Laptops',
				'Accessories',
				'Headphones',
				'Food',
				'Books',
				'Clothes/Shoes',
				'Beauty/Health',
				'Sports',
				'Outdoor',
				'Home',
			],
			message: 'please select correct category',
		},
	},
	seller: {
		type: String,
		required: [true, 'please enter product seller'],
	},
	stock: {
		type: Number,
		required: [true, 'please enter product stock'],
		maxLength: [100, 'product stock cannot exced 100 units '],
		default: 0,
	},
	numOfReviews: {
		type: Number,
		default: 0,
	},
	reviews: [
		{
			user: {
				type: mongoose.Schema.ObjectId,
				ref: 'User',
				required: true,
			},
			name: {
				type: String,
				required: true,
			},
			rating: {
				type: Number,
				required: true,
			},
			comment: {
				type: String,
				required: true,
			},
		},
	],
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Product', productSchema);
