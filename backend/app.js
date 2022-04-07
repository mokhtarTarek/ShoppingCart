const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const productRoute = require('./routes/productRoute');
const authRoute = require('./routes/authRoute');
const orderRoute = require('./routes/orderRoute');

if (process.env.NODE_ENV === 'developement') {
	app.use(morgan('dev')); //THIRD PARTY MW
}
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', authRoute);
app.use('/api/v1', productRoute);
app.use('/api/v1', orderRoute);

// error handler middleware
app.use(errorHandler);

module.exports = app;
