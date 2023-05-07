const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');

const {
  getCheckoutUrl,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  createBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

router.get('/paymob/:tourId', getCheckoutUrl);

router.use(restrictTo(['admin', 'lead-guide']));

router.route('/').get(getBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
