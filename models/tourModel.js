/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      // remove white spaces at start and end
      trim: true,
      maxlength: [40, 'A tour name must have at most 40 characters'],
      minlength: [10, 'A tour name must have at least 10 characters'],
      // using validator library by passing a callback function
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contain alpha characters',
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // custom validator
      // returns boolean
      validate: {
        validator: function (val) {
          // this points to document on creation only and does not work with update
          return val < this.price; // 100 < 200
        },
        // message has access to value which is related to mongoose
        message: 'Discount price ({VALUE}) should below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    // define array
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // to always hide it
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    // We can delete startLocation and set locations[0] as the start
    // GeoJSON to specify Geospatial data
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // longitude latitude
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  // schema options
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 1 ascending
// -1 descending
// tourSchema.index({ price: 1 });

// Compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// ///////////////////////////////////////
// Derived value that does not persist in the DB but sent with each query
// Cannot be used in queries
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// ///////////////////////////////////////

// Document Middleware runs before .save() and .create()
// "save" is called hook
tourSchema.pre('save', function (next) {
  // this points to currently processed document
  this.slug = slugify(this.name, { lower: true });

  next();
});

// embedding tour guides in tour documents
// tourSchema.pre('save', async function (next) {
//   const promises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(promises);

//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// ///////////////////////////////////////
// Query Middleware
// applied before actual execution
// all methods starts with find
tourSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ secretTour: { $ne: true } });
  // this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  // populate to look like it is embedded
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// applied after actual execution
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} ms`);
//   console.log(docs);

//   next();
// });

// Aggregation middleware
// applied before actual execution
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
