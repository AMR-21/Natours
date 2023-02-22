const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
// const AppError = require('../utils/appError');
const factory = require('./factory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1 get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2 create checkout session
  const session = await stripe.checkout.sessions.create({
    // info about session
    mode: 'payment',
    payment_method_types: ['card'],
    // prettier-ignore
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // info about product
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3 create checkout session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  // next();
  res.redirect(`${req.protocol}://${req.get('host')}/`);
});

exports.getBookings = factory.getAll(Booking, 'bookings');
exports.getBooking = factory.getOne(Booking, 'booking');
exports.updateBooking = factory.updateOne(Booking, 'booking');
exports.createBooking = factory.createOne(Booking, 'booking');
exports.deleteBooking = factory.deleteOne(Booking);
