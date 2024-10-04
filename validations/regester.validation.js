const { body, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');


// Register validation rules
const registerValidation = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  body('gender').isIn(['male', 'female']).withMessage('Invalid gender'),
];


// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),

  // Check validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  registerValidation,
  loginValidation
};
