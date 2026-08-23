const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

function generateToken(id) {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

class AuthService {
  async register({ name, email, password, role = 'operator' }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanName = name ? name.trim() : 'Operator';

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      const error = new Error('An account with this email already exists. Please sign in instead.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: role === 'admin' ? 'admin' : 'operator',
      lastLogin: new Date()
    });

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      token
    };
  }

  async demoLogin() {
    const demoEmail = 'operator@sagaragent.io';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Lead AI Operator',
        email: demoEmail,
        password: 'password123',
        role: 'operator',
        lastLogin: new Date()
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      token
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
  }
}

module.exports = new AuthService();
