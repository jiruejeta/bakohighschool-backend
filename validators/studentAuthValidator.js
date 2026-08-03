const { body } = require('express-validator');

const studentLoginValidator = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { studentLoginValidator };