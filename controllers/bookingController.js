const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const factory = require('./factory');

exports.getCheckoutUrl = catchAsync(async (req, res, next) => {
  // 1 get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) return next(new AppError('No tour found with that ID', 404));

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
          id: tour.id,
          amount_cents: tour.price * 100,
          description:
            'Exploring the jaw-dropping US east coast by foot and by boat',
          quantity: '1',
        },
      ],
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
  //accept.paymobsolutions.com/api/acceptance/iframes/{{your_iframe_id}}?payment_token={{payment_token_obtained_from_step_3}}

  res.status(200).json({
    status: 'success',
    url: paymentUrl,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;

//   if (!tour || !user || !price) return next();

//   await Booking.create({ tour, user, price });

//   // next();
//   res.redirect(`${req.protocol}://${req.get('host')}/`);
// });
exports.createBookingCheckout = async (req, res, next) => {
  // const tour = session.client_reference_id;
  // const user = (await User.findOne({ email: session.customer_email })).id;
  // const price = session.amount_total / 100;

  // await Booking.create({ tour, user, price });
  if (req.body.obj.success) {
  }
  console.log(req.body.obj.order.items);
  console.log(req.body.obj.payment_key_claims.billing_data);

  res.status(200).send('ok');
};

exports.getBookings = factory.getAll(Booking, 'bookings');
exports.getBooking = factory.getOne(Booking, 'booking');
exports.updateBooking = factory.updateOne(Booking, 'booking');
exports.createBooking = factory.createOne(Booking, 'booking');
exports.deleteBooking = factory.deleteOne(Booking);

exports.webhookCheckout = (req, res, next) => {
  let event;
  try {
    const signature = req.headers['stripe-signature'];

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};
