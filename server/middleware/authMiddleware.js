const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Auth check - Headers:', { 
    authorization: req.headers.authorization ? 
      `${req.headers.authorization.substring(0, 20)}...` : 'undefined'
  });

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? `${token.substring(0, 15)}...` : 'undefined');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('User not found for ID:', decoded.id);
        res.status(401);
        throw new Error('User not found');
      }
      
      console.log('Auth successful for user:', req.user._id.toString());
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      res.status(401);
      throw new Error('Not authorized');
    }
  } else {
    console.log('No Bearer token found in authorization header');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect }; 