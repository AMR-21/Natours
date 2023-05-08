// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const factory = require('./factory');

exports.getCheckoutUrl = catchAsync(async (req, res, next) => {
  const { tourId, userId } = req.params;

  // 1 get currently booked tour
  const tour = await Tour.findById(tourId);

  if (!tour) return next(new AppError('No tour found with that ID', 404));

  const user = await User.findById(userId);

  if (!user) return next(new AppError('No user found with that ID', 404));

  // Get auth token
  const response = await axios({
    method: 'POST',
    url: 'https://accept.paymob.com/api/auth/tokens',
    data: {
      api_key: process.env.PAYMOB_API_KEY,
    },
  });

  const { token } = response.data;

  // Use token to create order
  const order = await axios({
    method: 'POST',
    url: 'https://accept.paymob.com/api/ecommerce/orders',
    data: {
      auth_token: token,
      delivery_needed: 'false',
      amount_cents: tour.price * 100,
      currency: 'EGP',
      items: [
        {
          name: tour.name,
          amount_cents: tour.price * 100,
          description: `${userId}-${tourId}-${tour.summary}`,
          quantity: '1',
        },
      ],
      metadata: {
        tour: tourId,
      },
    },
  });

  const orderId = order.data.id;

  // use token and order id to get payment key
  const payment = await axios({
    method: 'POST',
    url: 'https://accept.paymob.com/api/acceptance/payment_keys',
    data: {
      auth_token: token,
      amount_cents: tour.price * 100,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        id: req.user.id,
        apartment: 'NA',
        email: req.user.email,
        floor: 'NA',
        first_name: req.user.name,
        street: 'NA',
        building: 'NA',
        phone_number: '-',
        shipping_method: 'NA',
        postal_code: 'NA',
        city: 'NA',
        country: 'NA',
        last_name: '-',
        state: 'NA',
      },
      currency: 'EGP',
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    },
  });

  const paymentKey = payment.data.token;

  // generate payment url
  const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_FRAME_ID}?payment_token=${paymentKey}`;

  res.status(200).json({
    status: 'success',
    url: paymentUrl,
  });
});

exports.getBookings = factory.getAll(Booking, 'bookings');
exports.getBooking = factory.getOne(Booking, 'booking');
exports.updateBooking = factory.updateOne(Booking, 'booking');
exports.createBooking = factory.createOne(Booking, 'booking');
exports.deleteBooking = factory.deleteOne(Booking);

exports.completeCheckout = catchAsync(async (req, res, next) => {
  if (!req.body.obj.success) next();

  const price = req.body.obj.order.items[0].amount_cents / 100;

  const [user, tour] = req.body.obj.order.items[0].description.split('-');

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  res.status(200).send('ok');
});
