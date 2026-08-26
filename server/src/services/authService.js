const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { isInMemory } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const User = require('../models/User');

class AuthService {
  async register({ name, email, password, role = 'operator' }) {
    const normalizedEmail = email.toLowerCase().trim();

    if (isInMemory()) {
      const usersCollection = memoryStore.getCollection('users');
      const existing = await usersCollection.findOne({ email: normalizedEmail });
      if (existing) {
        throw new ApiError(400, 'User with this email already exists');
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await usersCollection.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'operator',
        lastLogin: new Date(),
      });

      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userResponse = { ...newUser };
      delete userResponse.password;

      return { user: userResponse, token };
    } else {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        throw new ApiError(400, 'User with this email already exists');
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: role || 'operator',
        lastLogin: new Date(),
      });

      const token = user.generateAuthToken();
      const userResponse = user.toObject();
      delete userResponse.password;

      return { user: userResponse, token };
    }
  }

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    if (isInMemory()) {
      const usersCollection = memoryStore.getCollection('users');
      const user = await usersCollection.findOne({ email: normalizedEmail });
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
      }

      await usersCollection.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userResponse = { ...user, lastLogin: new Date() };
      delete userResponse.password;

      return { user: userResponse, token };
    } else {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Update lastLogin without triggering user.save() password re-hashing
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      const token = user.generateAuthToken();
      const userResponse = user.toObject();
      delete userResponse.password;

      return { user: userResponse, token };
    }
  }

  async getProfile(userId) {
    if (isInMemory()) {
      const user = await memoryStore.getCollection('users').findById(userId);
      if (!user) throw new ApiError(404, 'User not found');
      const userResponse = { ...user };
      delete userResponse.password;
      return userResponse;
    } else {
      const user = await User.findById(userId).select('-password');
      if (!user) throw new ApiError(404, 'User not found');
      return user;
    }
  }
}

module.exports = new AuthService();
