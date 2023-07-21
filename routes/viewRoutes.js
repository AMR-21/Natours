const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getMe,
  getMyTours,
  alerts,
  getSignedUp,
  getForgot,
  getReset,
  review,
  checkout,
  getMngTours,
  getMngUsers,
  getMngReviews,
  getMngBookings,
} = require('../controllers/viewsController');

const {
  isLoggedIn,
  protect,
  verifyHMAC,
  restrictTo,
} = require('../controllers/authController');

const router = express.Router();

router.use(alerts);

router.get('/', isLoggedIn, getOverview);
router.get('/signup', getSignedUp);
router.get('/forgot', getForgot);
router.get('/reset/:token', getReset);
router.get('/review', review);
router.get('/login', isLoggedIn, getLogin);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/me', protect, getMe);
router.get('/my-tours', protect, getMyTours);
router.get('/paymob/pay', isLoggedIn, verifyHMAC, checkout);
router.get('/mngTours', protect, restrictTo('admin'), getMngTours);
router.get('/mngUsers', protect, restrictTo('admin'), getMngUsers);
router.get('/mngReviews', protect, restrictTo('admin'), getMngReviews);
router.get('/mngBookings', protect, restrictTo('admin'), getMngBookings);

module.exports = router;
