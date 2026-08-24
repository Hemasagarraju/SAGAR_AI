const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

function generateToken(id) {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

function isAdminEmail(email) {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return (
    clean === 'hemasagarraju94@gmail.com' ||
    clean.startsWith('admin@') ||
    clean.includes('hemasagar')
  );
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

    const assignedRole = isAdminEmail(cleanEmail) || role === 'admin' ? 'admin' : 'operator';

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: assignedRole,
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
    const demoEmail = 'operator@sagar.ai';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Demo Operator',
        email: demoEmail,
        password: 'password123',
        role: 'operator',
        lastLogin: new Date()
      });
    } else {
      user.name = 'Demo Operator';
      user.role = 'operator';
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

  async adminDemoLogin() {
    const adminEmail = 'hemasagarraju94@gmail.com';
    let user = await User.findOne({ email: adminEmail });

    if (!user) {
      user = await User.create({
        name: 'Hemasagar Raju (Master Admin)',
        email: adminEmail,
        password: 'password123',
        role: 'admin',
        lastLogin: new Date()
      });
    } else {
      user.name = 'Hemasagar Raju (Master Admin)';
      user.role = 'admin';
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
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanPassword = password ? password.trim() : '';

    let user = await User.findOne({ email: cleanEmail }).select('+password');

    // Auto-bootstrap master admin if signing in for the first time
    if (!user && isAdminEmail(cleanEmail)) {
      user = await User.create({
        name: 'Hemasagar Raju (Master Admin)',
        email: cleanEmail,
        password: cleanPassword || 'password123',
        role: 'admin',
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

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    let isMatch = await user.matchPassword(cleanPassword);
    // Allow master admin auto-reset with password123 if previously registered with another password
    if (!isMatch && isAdminEmail(cleanEmail) && cleanPassword === 'password123') {
      user.password = 'password123';
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (isAdminEmail(cleanEmail) && user.role !== 'admin') {
      user.role = 'admin';
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

  async getAllUsers() {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || 'operator',
      lastLogin: u.lastLogin,
      createdAt: u.createdAt
    }));
  }
}

module.exports = new AuthService();
