const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { isInMemory } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing or invalid');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    let user = null;
    if (isInMemory()) {
      user = await memoryStore.getCollection('users').findById(decoded.id);
    } else {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      throw new ApiError(401, 'User account no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Not authorized to access this resource');
  }
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Permission denied for this action'));
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
