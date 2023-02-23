const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getMe,
  getMyTours,
  alerts,
} = require('../controllers/viewsController');

const { isLoggedIn, protect } = require('../controllers/authController');
// const { createBookingCheckout } = require('../controllers/bookingController');

const router = express.Router();

router.use(alerts);

router.get('/', isLoggedIn, getOverview);
router.get('/login', isLoggedIn, getLogin);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/me', protect, getMe);
router.get('/my-tours', protect, getMyTours);

module.exports = router;
