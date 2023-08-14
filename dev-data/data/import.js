const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: '../../config.env' });

mongoose.connect(
  `${process.env.DB.replace('<password>', process.env.DB_PASSWORD)}`,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
);

// READ JSON FILE

const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
const tours = JSON.parse(fs.readFileSync('tours.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('reviews.json', 'utf-8'));

// Import Data in DB

const importData = async () => {
  try {
    // await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);
    // console.log('Success');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete data
const deleteAll = async () => {
  try {
    // await Tour.deleteMany();
    await User.deleteMany();
    // await Review.deleteMany();
    // console.log('Success');
    process.exit();
  } catch (err) {
    // console.log(err);
  }
};

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteAll();
