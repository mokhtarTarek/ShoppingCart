require('dotenv').config({ path: `${__dirname}/../config/config.env` });

const Product = require('../models/productModel');
const connectDatabase = require('./../config/database');
const products = require('../data/products');

connectDatabase();

const seedProducts = async () => {
	try {
		await Product.deleteMany();
		console.log('products deleted from database');

		await Product.insertMany(products);
		console.log('products inserted to database');

		process.exit();
	} catch (error) {
		console.log(error.message);
		process.exit();
	}
};
seedProducts();
