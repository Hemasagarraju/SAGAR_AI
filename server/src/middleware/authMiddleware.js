const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.jwtSecret);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User account not found'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed or expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no bearer token provided'
    });
  }
};

module.exports = { protect };
