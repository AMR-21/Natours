/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// Import necessary dependencies and functions
const jwt = require('jsonwebtoken');

const { sendToken } = require('../controllers/authController'); // Replace '../your-file' with the path to your file containing the functions

require('dotenv').config({ path: '../config.env' });

describe('sendToken function', () => {
  let res;
  let req;

  beforeEach(() => {
    // Mock the Express response and request objects
    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    req = {
      secure: true,
      get: jest.fn().mockReturnValue('https'),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should send the token and user data in the response', () => {
    const user = {
      _id: 'user-id',
      password: 'password',
    };

    // Mock the JWT sign function
    jwt.sign = jest.fn().mockReturnValue('mocked-token');

    sendToken(user, 200, req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-id' },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    expect(res.cookie).toHaveBeenCalledWith('jwt', 'mocked-token', {
      expires: expect.any(Date),
      httpOnly: true,
      secure: true,
    });

    expect(user.password).toBeUndefined();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      token: 'mocked-token',
      data: {
        user: { _id: 'user-id' },
      },
    });
  });
});
