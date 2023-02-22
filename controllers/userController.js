const multer = require('multer');
const sharp = require('sharp');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./factory');

// save directly to disk
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // cb is callback
//     // first argument is error
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-1282188142-132191249214.jpg
//     // file comes from req.file
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// save to memory buffer first to ease the process of sharp 'resizing'
const multerStorage = multer.memoryStorage();

// test for the file type before upload
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) return cb(null, true);

  cb(new AppError('Not an image', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.uploadPhoto = upload.single('photo');

const filterObj = (obj, ...fields) => {
  const filtered = {};

  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) filtered[el] = obj[el];
  });

  return filtered;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined, Use /signup instead',
  });
};

exports.getAllUsers = factory.getAll(User, 'users');
exports.getUser = factory.getOne(User, 'user');
exports.updateUser = factory.updateOne(User, 'user');
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTs password data

  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates, Please use /updatePassword',
        400
      )
    );

  // 2) update user document

  // to avoid changing forbidden fields
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
