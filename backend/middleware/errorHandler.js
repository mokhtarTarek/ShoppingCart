// GLOBAL MIDDLEWARE HANDLER
// this function is called whenever next(err) is invocked with(err)
// this function take err as first params
const AppError = require('../utils/AppError');
module.exports = (err, req, res, next) => {
	// status and message from the instance of Error class or defaults values
	err.statusCode = err.statusCode || 500;

	if (process.env.NODE_ENV === 'developement') {
		res.status(err.statusCode).json({
			success: false,
			error: err,
			errMessage: err.message,
			stack: err.stack,
		});
	}
	if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		error.message = err.message;

		// wrong mongoose id
		if (err.name === 'CastError') {
			const message = `Resource not found invalid ${err.path}`;
			error = new AppError(message, 400);
		}
		// handling mongoose validation
		if (err.name === 'validationError') {
			// Object.values(): returns an array object prop values
			const message = Object.values(err.errors).map((value) => value.message);
			//error = new AppError(err.errMessage, 400);
			error = new AppError(message, 400);
		}

		// handling mongoose duplicate key errors
		if (err.code === 11000) {
			const message = `duplicate ${Object.keys(err.keyValue)} entred`;
			error = new AppError(message, 400);
		}

		//handel JWT error
		if (err.name === 'JsonWebTokenError') {
			const message = `JWT is invalid! try again`;
			error = new AppError(message, 400);
		}
		if (err.name === 'TokenExpiredError') {
			const message = `JWT is expire! try again`;
			error = new AppError(message, 400);
		}

		res.status(err.statusCode).json({
			success: false,
			message: error.message || 'internal server error',
		});
	}
};
