const { body } = require('express-validator');

const nationalExamValidator = [
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 }).withMessage('Year must be a valid year'),
  body('title').optional().trim(),
];

module.exports = { nationalExamValidator };