const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    throw new ApiError(400, 'Validation failed for request parameters', errorList);
  }
  next();
};

module.exports = validate;
