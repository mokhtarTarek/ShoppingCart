require('dotenv').config({ path: `${__dirname}/config/config.env` });
const connectDatabase = require('./config/database');

//HANDLE UNCAUGHT (NON CATCHED) EXCEPTION : BUGS
process.on('uncaughtException', (err) => {
	console.log(err.name, err.message);
	console.log('application shutting down');
	process.exit(1);
});

const app = require('./app');

connectDatabase();
app.listen(process.env.PORT, () => {
	console.log(
		`server start on port : ${process.env.PORT} in ${process.env.NODE_ENV} mode`
	);
});

// HANLDE ALL PROMISE REJECTIONS
process.on('unhandledRejection', (err) => {
	console.log(err.name, err.message);
	console.log('application shutting down');
	server.close(() => {
		//to shutdown the app
		process.exit(1);
	});
});
