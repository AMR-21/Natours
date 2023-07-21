const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Review must be have a rating'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  }, // schema options
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// to avoid duplicates reviews on single review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // populate to look like it is embedded
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  // to avoid nested population
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  this.select('-__v');

  next();
});

reviewSchema.statics.calcAvgRatings = async function (tourId) {
  // this points to current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0)
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  else
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
};

reviewSchema.post('save', function () {
  // this points to current review
  // constructor points to the model
  this.constructor.calcAvgRatings(this.tour);
  // console.log(this.constructor.calcAvgRatings);
});

//findByIdAndUpdate
//findByIdAndDelete
// to go around that query middleware does not have access to document
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // get doc from db before save
  // and pass it the other middleware
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // this.r is the document
  // this.findOne() will not work as the query has already been executed
  await this.r.constructor.calcAvgRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
