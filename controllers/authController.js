const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { URL } = require('url');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
// const factory = require('./factory');

exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.sendToken = (user, statusCode, req, res) => {
  const token = module.exports.signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.get('x-forwarded-proto') === 'https',
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  module.exports.sendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  // 2) check if  user exists & password is correct
  // + with fields with select:false
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // 3) if all is correct, send jwt
  module.exports.sendToken(user, 200, req, res);
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the jwt and check if it exists

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token === 'null')
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );

  // 2) validate the jwt from the pay load
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exists
  const user = await User.findById(decoded.id);

  if (!user)
    return next(new AppError('The user of this token no longer exists', 401));

  // 4) check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password, please log in again', 401)
    );

  // grant access to protected route
  req.user = user;
  // res.locals is accessed by bug
  res.locals.user = user;
  next();
});

// Only for rendered pages, no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) get the jwt and check if it exists
  if (!req.cookies.jwt) return next();

  // 2) validate the jwt from the pay load
  const decoded = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );

  // 3) check if user still exists
  const user = await User.findById(decoded.id);

  if (!user)
    return next(new AppError('The user of this token no longer exists', 401));

  // 4) check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password, please log in again', 401)
    );

  // There is a logged in user
  // res.locals is accessed by bug
  res.locals.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('There is no user with that email address', 404));

  // 2) generate the random token
  const resetToken = user.createPasswordResetToken();

  // option to skip the required fields on save
  await user.save({ validateBeforeSave: false });

  // 3) send it to user's email

  try {
    // prettier-ignore
    const resetURL = `${req.protocol}://${req.get('host')}/reset/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error with sending the email. Try again later!',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  const token = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  // 2) if token has not expired, and user exists, set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // define as document middleware on model

  // 4) log user in, send JWT
  module.exports.sendToken(user, 200, req, res);
});

// TODO new not similar as old
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get the user from the collection
  const user = await User.findById(req.user._id).select('+password');

  // 2) check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError('Your current password is not correct', 401));

  // 3) if so , update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in, send JWT
  module.exports.sendToken(user, 200, req, res);
});

// CCD1251AFDFCC8CF7C1FFAD476FEE3E0
exports.verifyHMAC = (req, res, next) => {
  const fields = JSON.parse(process.env.PAYMOB_HMAC_STRING_KEYS);

  let hmacString;
  let rcvdHMAC;

  // Get pair values and form HMAC string
  if (req.method === 'POST') {
    const data = req.body.obj;
    const { hmac } = req.query;
    rcvdHMAC = hmac;

    hmacString = fields
      .map((field) => {
        if (field.includes('.')) {
          const [obj, key] = field.split('.');
          return data[obj][key];
        }
        return data[field];
      })
      .join('');
  }

  if (req.method === 'GET') {
    // eslint-disable-next-line node/no-unsupported-features/es-builtins
    const data = Object.fromEntries(
      new URL(`${req.protocol}://${req.get('host')}/${req.url}`).searchParams
    );

    rcvdHMAC = data.hmac;

    hmacString = fields
      .map((field) => {
        if (field === 'order.id') return data.order;
        return data[field];
      })
      .join('');
  }

  // Hash HMAC string
  const HMAC = crypto
    .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
    .update(hmacString)
    .digest('hex');

  // Verify the HMAC
  if (HMAC !== rcvdHMAC)
    return next(new AppError('HMAC verification failed', 401));

  next();
};
