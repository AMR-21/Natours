const express = require('express');
const {
  protect,
  restrictTo,
  verifyHMAC,
} = require('../controllers/authController');

const {
  getCheckoutUrl,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  createBooking,
  completeCheckout,
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/paymob/pay', verifyHMAC, completeCheckout);

router.use(protect);

router.get('/paymob/:tourId/:userId', getCheckoutUrl);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(getBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
