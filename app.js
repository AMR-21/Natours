// 3rd party
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

// own
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const { webhookCheckout } = require('./controllers/bookingController');

const app = express();

app.enable('trust proxy');

// set the template engine in express
// templates are called views in pug
app.set('view engine', 'pug');
// set the path to views folder
app.set('views', path.join(__dirname, 'views'));

// Global Middleware
// implement CORS
app.use(cors());
// Access-Control-Allow-Origin *

// in case wants not to share the api and select some only
// api.natours.com , natours.com
// app.use(
//   cors({
//     origin: 'https://www.natours.com',
//   })
// );

// preflight phase
// to handle complex requests delete/patch/put
app.options('*', cors());
// '*' can be 'api/v1/tours/:id'

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// set security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// limit request from same api
// 100 request from same ip per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// route put here because it is needed in raw format before being parsed by express.json
// app.post(
//   '/webhook-checkout',
//   express.raw({ type: 'application/json' }),
//   webhookCheckout
// );

// body-parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// data sanitization against NoSQL query injection and XSS "CROSS SITE SCRIPTING ATTACKS"
app.use(mongoSanitize());
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// test middleware
app.use((req, res, next) => {
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// Routers
// executes in order
app.use('/', viewRouter);

// API routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// handling undefined routers
// * -> everything
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // whenever next receives an argument express detect it as an error
  // skip all other middlewares and and execute global error middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// global error middleware
app.use(globalErrorHandler);

module.exports = app;
