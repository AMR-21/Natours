// render renders the template name passed
// location specified up (views)
// object is set of variables passed to pug and called locals there
// res.status(200).render('base', {
//   title: 'KOSOMK',
// });
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tours data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('overview', {
      title: 'All Tours',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get data for requested tour tour with reviews and guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) return next(new AppError('There is no tour with that name.', 404));

  // 2) build the template

  // 3) Render that template using data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLogin = (req, res, next) => {
  // 1) build the template

  // 2) Render that template using data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: `Log into your account`,
    });
};

exports.getMe = (req, res) => {
  // 1) build the template

  // 2) Render that template using data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('account', {
      title: `Your account`,
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1 find all bookings
  // 2 find tours with the returned ids
  const bookings = await Booking.find({ user: req.user.id }).populate({
    path: 'tourData',
  });

  const tours = bookings.map((el) => el.tourData[0]);

  /*
  const bookings = await Booking.find({user:req.user.id})

  const tourIDs = bookings.map(el=>  el.tour)

  const tours = await Tour.find({_id :{$in:tourIDs} })
   */

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('overview', {
      title: 'My Tours',
      tours,
    });
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking')
    req.locals.alert =
      'Booking was completed successfully, if it does not appear come back in a moment';

  next();
};
exports.getSignedUp = (req, res, next) => {
  // 1) build the template

  // 2) Render that template using data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('signup', {
      title: `Your account`,
    });
  next();
};
exports.review = (req, res) => {
  // 1) build the template

  // 2) Render that template using data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('review', {
      title: `Reviews`,
    });
};

exports.getForgot = (req, res) => {
  // 1) build the template

  // 2) Render that template using data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('forgot', {
      title: `Forgot your password`,
    });
};

exports.getReset = catchAsync(async (req, res, next) => {
  // 1) Get data for requested tour tour with reviews and guides
  // const tour = await Tour.findOne({ slug: req.params.slug }).populate({
  //   path: 'reviews',
  //   fields: 'review rating user',
  // });

  // if (!tour) return next(new AppError('There is no tour with that name.', 404));

  // 2) build the template

  // 3) Render that template using data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('reset', {
      title: `AAAA`,
    });
});
