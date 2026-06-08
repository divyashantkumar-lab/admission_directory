const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        msg: e.msg,
      })),
    });
  }
  next();
}

function requestedWith(req, res, next) {
  const header = req.headers['x-requested-with'];
  if (header !== 'XMLHttpRequest') {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid X-Requested-With header',
      errors: [],
    });
  }
  next();
}

module.exports = { validate, requestedWith };
