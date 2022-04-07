const mongoose = require('mongoose');
require('dotenv').config({ path: `${__dirname}config.env` });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
const connectDatabase = () => {
	mongoose
		.connect(DB, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		})
		.then((con) => {
			//console.log(con.connections)
			console.log('connected to database successfully...');
		});
};
module.exports = connectDatabase;
