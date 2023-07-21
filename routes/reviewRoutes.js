const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');

const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setupReview,
  getReview,
} = require('../controllers/reviewController');

// Review Router
// merge params merge parameters from the other routes if it does exits
// /tours/:tourId/reviews review router will have access to tourId
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .get('/', getAllReviews)
  .post('/', restrictTo('user'), setupReview, createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;
