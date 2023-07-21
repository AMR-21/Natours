const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./factory');

exports.setupReview = (req, res, next) => {
  // tour and user fields in review schema
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getAllReviews = factory.getAll(Review, 'reviews');
exports.getReview = factory.getOne(Review, 'review');
exports.createReview = factory.createOne(Review, 'review');
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review, 'review');
